import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderer } from './renderer'
import type { Bindings, Event, Application, InvitationCode, ApiResponse } from './types'

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定（API用）
app.use('/api/*', cors())

// HTMLレンダラー設定
app.use(renderer)

// ======================
// API Routes
// ======================

// イベント一覧取得API
app.get('/api/events', async (c) => {
  try {
    const { DB } = c.env
    const { status, type } = c.req.query()
    
    let query = 'SELECT * FROM events WHERE 1=1'
    const params: any[] = []
    
    if (status) {
      query += ' AND status = ?'
      params.push(status)
    }
    
    if (type) {
      query += ' AND event_type = ?'
      params.push(type)
    }
    
    query += ' ORDER BY event_date ASC'
    
    const { results } = await DB.prepare(query).bind(...params).all<Event>()
    
    return c.json<ApiResponse<Event[]>>({
      success: true,
      data: results
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 特定イベント取得API（講師情報も含む）
app.get('/api/events/:id', async (c) => {
  try {
    const { DB } = c.env
    const eventId = c.req.param('id')
    
    const event = await DB.prepare(
      'SELECT * FROM events WHERE id = ?'
    ).bind(eventId).first<Event>()
    
    if (!event) {
      return c.json<ApiResponse>({
        success: false,
        error: 'イベントが見つかりません'
      }, 404)
    }

    // 講師・スタッフ情報を取得
    const { results: staff } = await DB.prepare(
      'SELECT * FROM event_staff WHERE event_id = ? ORDER BY display_order ASC'
    ).bind(eventId).all()
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        ...event,
        staff: staff || []
      }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 招待コード検証API
app.post('/api/validate-code', async (c) => {
  try {
    const { DB } = c.env
    const { code, eventId } = await c.req.json<{ code: string; eventId?: number }>()
    
    if (!code) {
      return c.json<ApiResponse>({
        success: false,
        error: '招待コードを入力してください'
      }, 400)
    }
    
    // 招待コード検証
    let query = `
      SELECT * FROM invitation_codes 
      WHERE code = ? AND is_active = 1
    `
    const params: any[] = [code]
    
    if (eventId) {
      query += ' AND (event_id = ? OR event_id IS NULL)'
      params.push(eventId)
    }
    
    const invCode = await DB.prepare(query).bind(...params).first<InvitationCode>()
    
    if (!invCode) {
      return c.json<ApiResponse>({
        success: false,
        error: '無効な招待コードです'
      }, 400)
    }
    
    // 使用回数チェック
    if (invCode.current_uses >= invCode.max_uses) {
      return c.json<ApiResponse>({
        success: false,
        error: 'この招待コードは使用上限に達しています'
      }, 400)
    }
    
    // 有効期限チェック
    if (invCode.expires_at && new Date(invCode.expires_at) < new Date()) {
      return c.json<ApiResponse>({
        success: false,
        error: 'この招待コードは有効期限切れです'
      }, 400)
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: '有効な招待コードです'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 参加申込API
app.post('/api/applications', async (c) => {
  try {
    const { DB } = c.env
    const data = await c.req.json<Partial<Application>>()
    
    // バリデーション
    if (!data.event_id || !data.company_name || !data.applicant_name || !data.email) {
      return c.json<ApiResponse>({
        success: false,
        error: '必須項目を入力してください'
      }, 400)
    }
    
    // イベント存在確認
    const event = await DB.prepare(
      'SELECT * FROM events WHERE id = ? AND status = ?'
    ).bind(data.event_id, 'upcoming').first<Event>()
    
    if (!event) {
      return c.json<ApiResponse>({
        success: false,
        error: '申込可能なイベントが見つかりません'
      }, 404)
    }
    
    // 定員チェック
    if (event.current_participants >= event.capacity) {
      return c.json<ApiResponse>({
        success: false,
        error: 'このイベントは定員に達しています'
      }, 400)
    }
    
    // 招待コード検証（提供された場合）
    if (data.invitation_code) {
      const codeCheck = await DB.prepare(`
        SELECT * FROM invitation_codes 
        WHERE code = ? AND is_active = 1 
        AND (event_id = ? OR event_id IS NULL)
      `).bind(data.invitation_code, data.event_id).first<InvitationCode>()
      
      if (!codeCheck) {
        return c.json<ApiResponse>({
          success: false,
          error: '無効な招待コードです'
        }, 400)
      }
      
      if (codeCheck.current_uses >= codeCheck.max_uses) {
        return c.json<ApiResponse>({
          success: false,
          error: 'この招待コードは使用上限に達しています'
        }, 400)
      }
      
      // 招待コード使用回数更新
      await DB.prepare(
        'UPDATE invitation_codes SET current_uses = current_uses + 1 WHERE code = ?'
      ).bind(data.invitation_code).run()
    }
    
    // 申込登録
    const result = await DB.prepare(`
      INSERT INTO applications (
        event_id, invitation_code, participant_type, company_name, applicant_name, 
        position, email, phone, ai_usage_examples, consultation_topics, 
        referrer_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.event_id,
      data.invitation_code || null,
      data.participant_type || 'business_owner',
      data.company_name,
      data.applicant_name,
      data.position || null,
      data.email,
      data.phone || null,
      data.ai_usage_examples || null,
      data.consultation_topics || null,
      data.referrer_name || null,
      'pending'
    ).run()
    
    // 参加者数更新
    await DB.prepare(
      'UPDATE events SET current_participants = current_participants + 1 WHERE id = ?'
    ).bind(data.event_id).run()
    
    return c.json<ApiResponse>({
      success: true,
      message: '申込が完了しました。確認メールをご確認ください。',
      data: { id: result.meta.last_row_id }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 申込一覧取得API（管理用）
app.get('/api/admin/applications', async (c) => {
  try {
    const { DB } = c.env
    const { eventId, status } = c.req.query()
    
    let query = `
      SELECT a.*, e.title as event_title 
      FROM applications a 
      LEFT JOIN events e ON a.event_id = e.id 
      WHERE 1=1
    `
    const params: any[] = []
    
    if (eventId) {
      query += ' AND a.event_id = ?'
      params.push(eventId)
    }
    
    if (status) {
      query += ' AND a.status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY a.applied_at DESC'
    
    const { results } = await DB.prepare(query).bind(...params).all()
    
    return c.json<ApiResponse>({
      success: true,
      data: results
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// イベント作成API（管理用）
app.post('/api/admin/events', async (c) => {
  try {
    const { DB } = c.env
    const data = await c.req.json<Partial<Event>>()
    
    const result = await DB.prepare(`
      INSERT INTO events (
        title, description, event_type, location, prefecture, address,
        event_date, start_time, end_time, capacity, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.title,
      data.description,
      data.event_type,
      data.location,
      data.prefecture || '静岡県',
      data.address || null,
      data.event_date,
      data.start_time,
      data.end_time || null,
      data.capacity || 20,
      data.status || 'upcoming'
    ).run()
    
    return c.json<ApiResponse>({
      success: true,
      message: 'イベントを作成しました',
      data: { id: result.meta.last_row_id }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 招待コード作成API（管理用）
app.post('/api/admin/invitation-codes', async (c) => {
  try {
    const { DB } = c.env
    const data = await c.req.json<Partial<InvitationCode>>()
    
    if (!data.code) {
      return c.json<ApiResponse>({
        success: false,
        error: '招待コードを入力してください'
      }, 400)
    }
    
    const result = await DB.prepare(`
      INSERT INTO invitation_codes (
        code, event_id, max_uses, expires_at, created_by, notes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.code,
      data.event_id || null,
      data.max_uses || 1,
      data.expires_at || null,
      data.created_by || 'admin',
      data.notes || null,
      1
    ).run()
    
    return c.json<ApiResponse>({
      success: true,
      message: '招待コードを作成しました',
      data: { id: result.meta.last_row_id }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ======================
// HTML Pages
// ======================

// トップページ
app.get('/', (c) => {
  return c.render(
    <div id="app"></div>
  )
})

// イベント詳細ページ
app.get('/events/:id', (c) => {
  return c.render(
    <div id="app"></div>
  )
})

// 申込フォームページ
app.get('/apply/:id', (c) => {
  return c.render(
    <div id="app"></div>
  )
})

// 管理画面
app.get('/admin', (c) => {
  return c.render(
    <div id="app"></div>
  )
})

export default app
