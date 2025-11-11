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
    
    // 支払い情報を設定
    const paymentAmount = event.payment_required ? event.price : 0
    const paymentStatus = event.payment_required ? 'pending' : 'paid'
    
    // 申込登録
    const result = await DB.prepare(`
      INSERT INTO applications (
        event_id, invitation_code, participant_type, company_name, applicant_name, 
        position, email, phone, ai_usage_examples, consultation_topics, 
        referrer_name, status, payment_status, payment_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      'pending',
      paymentStatus,
      paymentAmount
    ).run()
    
    // 参加者数更新
    await DB.prepare(
      'UPDATE events SET current_participants = current_participants + 1 WHERE id = ?'
    ).bind(data.event_id).run()
    
    // メール送信（確認メール）
    const { RESEND_API_KEY } = c.env
    if (RESEND_API_KEY) {
      try {
        const eventDate = new Date(event.event_date)
        const dateStr = `${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日`
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'AI夜会・AI茶会 <onboarding@resend.dev>',
            to: data.email,
            subject: `【申込受付】${event.title} のお申込を受け付けました`,
            html: `
              <h2>お申込ありがとうございます</h2>
              <p>${data.applicant_name} 様</p>
              <p>以下のイベントへのお申込を受け付けました。</p>
              
              <h3>イベント詳細</h3>
              <ul>
                <li><strong>イベント名:</strong> ${event.title}</li>
                <li><strong>開催日:</strong> ${dateStr} ${event.start_time}${event.end_time ? ' 〜 ' + event.end_time : ''}</li>
                <li><strong>会場:</strong> ${event.location}${event.address ? ' (' + event.address + ')' : ''}</li>
                ${event.payment_required && event.price > 0 ? `<li><strong>参加費:</strong> ¥${event.price.toLocaleString()}（当日現地回収）</li>` : '<li><strong>参加費:</strong> 無料</li>'}
              </ul>
              
              <p>当日お会いできることを楽しみにしています！</p>
              
              <hr>
              <p style="font-size: 12px; color: #666;">
                このメールは自動送信されています。<br>
                ご不明な点がございましたら、お気軽にお問い合わせください。
              </p>
            `
          })
        })
      } catch (emailError) {
        console.error('Email sending failed:', emailError)
        // メール送信失敗してもエラーにしない
      }
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: '申込が完了しました。確認メールをご確認ください。',
      data: { 
        id: result.meta.last_row_id,
        event: {
          id: event.id,
          title: event.title,
          price: event.price,
          is_free: event.is_free,
          payment_required: event.payment_required
        },
        payment_status: paymentStatus,
        payment_amount: paymentAmount
      }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 個別申込取得API
app.get('/api/applications/:id', async (c) => {
  try {
    const { DB } = c.env
    const id = c.req.param('id')
    
    const application = await DB.prepare(`
      SELECT a.*, e.title, e.event_date, e.start_time, e.price, e.is_free, e.payment_required
      FROM applications a 
      LEFT JOIN events e ON a.event_id = e.id 
      WHERE a.id = ?
    `).bind(id).first()
    
    if (!application) {
      return c.json<ApiResponse>({
        success: false,
        error: '申込が見つかりません'
      }, 404)
    }
    
    // イベント情報を別オブジェクトとして整形
    const formattedApplication = {
      ...application,
      event: {
        title: application.title,
        event_date: application.event_date,
        start_time: application.start_time,
        price: application.price,
        is_free: application.is_free,
        payment_required: application.payment_required
      }
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: formattedApplication
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
    
    const price = data.price || 0
    const isFree = price === 0 ? 1 : 0
    const paymentRequired = price > 0 ? 1 : 0
    
    const result = await DB.prepare(`
      INSERT INTO events (
        title, description, event_type, location, prefecture, address,
        event_date, start_time, end_time, capacity, status,
        price, is_free, payment_required
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.status || 'upcoming',
      price,
      isFree,
      paymentRequired
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
        code, event_id, max_uses, expires_at, notes, is_active
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.code,
      data.event_id || null,
      data.max_uses || 1,
      data.expires_at || null,
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

// 招待コード一覧取得API（管理用）
app.get('/api/admin/invitation-codes', async (c) => {
  try {
    const { DB } = c.env
    
    const { results } = await DB.prepare(`
      SELECT ic.*, e.title as event_title
      FROM invitation_codes ic
      LEFT JOIN events e ON ic.event_id = e.id
      ORDER BY ic.created_at DESC
    `).all()
    
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

// サイト設定取得API
app.get('/api/settings', async (c) => {
  try {
    const { DB } = c.env
    const { category } = c.req.query()
    
    let query = 'SELECT * FROM site_settings WHERE 1=1'
    const params: any[] = []
    
    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }
    
    query += ' ORDER BY category, display_order ASC'
    
    const { results } = await DB.prepare(query).bind(...params).all()
    
    // キーバリュー形式に変換
    const settings: Record<string, any> = {}
    results.forEach((setting: any) => {
      settings[setting.setting_key] = setting.setting_value
    })
    
    return c.json<ApiResponse>({
      success: true,
      data: settings
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// サイト設定一覧取得API（管理用）
app.get('/api/admin/settings', async (c) => {
  try {
    const { DB } = c.env
    
    const { results } = await DB.prepare(`
      SELECT * FROM site_settings 
      ORDER BY category, display_order ASC
    `).all()
    
    // カテゴリごとにグループ化
    const groupedSettings: Record<string, any[]> = {}
    results.forEach((setting: any) => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = []
      }
      groupedSettings[setting.category].push(setting)
    })
    
    return c.json<ApiResponse>({
      success: true,
      data: groupedSettings
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// サイト設定更新API（管理用）
app.put('/api/admin/settings', async (c) => {
  try {
    const { DB } = c.env
    const updates = await c.req.json<Record<string, string>>()
    
    // トランザクションの代わりに複数のUPDATEを実行
    for (const [key, value] of Object.entries(updates)) {
      await DB.prepare(`
        UPDATE site_settings 
        SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE setting_key = ?
      `).bind(value, key).run()
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: 'サイト設定を更新しました'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// テンプレート一覧取得API（管理用）
app.get('/api/admin/templates', async (c) => {
  try {
    const { DB } = c.env
    
    const { results } = await DB.prepare(`
      SELECT * FROM settings_templates 
      WHERE is_active = 1
      ORDER BY category, id ASC
    `).all()
    
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

// テンプレート適用API（管理用）
app.post('/api/admin/templates/:templateId/apply', async (c) => {
  try {
    const { DB } = c.env
    const templateId = c.req.param('templateId')
    
    // テンプレートの設定値を取得
    const { results: templateSettings } = await DB.prepare(`
      SELECT setting_key, setting_value 
      FROM template_settings 
      WHERE template_id = ?
    `).bind(templateId).all()
    
    if (!templateSettings || templateSettings.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'テンプレートが見つかりません'
      }, 404)
    }
    
    // 各設定値を現在の設定に適用
    for (const setting of templateSettings as any[]) {
      await DB.prepare(`
        UPDATE site_settings 
        SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE setting_key = ?
      `).bind(setting.setting_value, setting.setting_key).run()
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: 'テンプレートを適用しました'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// カスタムテンプレート保存API（管理用）
app.post('/api/admin/templates/custom', async (c) => {
  try {
    const { DB } = c.env
    const { template_name, display_name, description, icon } = await c.req.json()
    
    // 現在の設定値を取得
    const { results: currentSettings } = await DB.prepare(`
      SELECT setting_key, setting_value 
      FROM site_settings
    `).all()
    
    // テンプレートを作成
    const templateResult = await DB.prepare(`
      INSERT INTO settings_templates (template_name, display_name, description, category, icon)
      VALUES (?, ?, ?, 'custom', ?)
    `).bind(template_name, display_name, description, icon || '💾').run()
    
    const templateId = templateResult.meta.last_row_id
    
    // 現在の設定値をテンプレートとして保存
    for (const setting of currentSettings as any[]) {
      await DB.prepare(`
        INSERT INTO template_settings (template_id, setting_key, setting_value)
        VALUES (?, ?, ?)
      `).bind(templateId, setting.setting_key, setting.setting_value).run()
    }
    
    return c.json<ApiResponse>({
      success: true,
      message: 'カスタムテンプレートを保存しました',
      data: { id: templateId }
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ======================
// Stripe Payment APIs
// ======================

// Stripe Checkout Sessionを作成
app.post('/api/payments/create-checkout-session', async (c) => {
  try {
    const { DB, STRIPE_SECRET_KEY } = c.env
    const { application_id } = await c.req.json<{ application_id: number }>()
    
    if (!STRIPE_SECRET_KEY) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Stripe APIキーが設定されていません'
      }, 500)
    }
    
    // 申込情報を取得
    const application = await DB.prepare(`
      SELECT a.*, e.title as event_title, e.price, e.event_date, e.start_time
      FROM applications a
      JOIN events e ON a.event_id = e.id
      WHERE a.id = ?
    `).bind(application_id).first() as any
    
    if (!application) {
      return c.json<ApiResponse>({
        success: false,
        error: '申込情報が見つかりません'
      }, 404)
    }
    
    if (application.payment_status === 'paid') {
      return c.json<ApiResponse>({
        success: false,
        error: 'すでに支払い済みです'
      }, 400)
    }
    
    // Stripe Checkout Sessionを作成
    const checkoutData = {
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          product_data: {
            name: application.event_title,
            description: `開催日: ${application.event_date} ${application.start_time}`,
          },
          unit_amount: application.price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${c.req.url.split('/api')[0]}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.req.url.split('/api')[0]}/payment-cancel`,
      client_reference_id: application_id.toString(),
      customer_email: application.email,
      metadata: {
        application_id: application_id.toString(),
        event_id: application.event_id.toString(),
        applicant_name: application.applicant_name,
      }
    }
    
    // Stripe APIを呼び出す
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        Object.entries(checkoutData).flatMap(([key, value]) => {
          if (key === 'line_items') {
            return Object.entries(value[0]).flatMap(([k, v]) => {
              if (k === 'price_data') {
                return [
                  [`line_items[0][price_data][currency]`, v.currency],
                  [`line_items[0][price_data][unit_amount]`, v.unit_amount.toString()],
                  [`line_items[0][price_data][product_data][name]`, v.product_data.name],
                  [`line_items[0][price_data][product_data][description]`, v.product_data.description],
                ]
              }
              return [[`line_items[0][${k}]`, v.toString()]]
            })
          } else if (key === 'payment_method_types') {
            return value.map((v: string, i: number) => [`payment_method_types[${i}]`, v])
          } else if (key === 'metadata') {
            return Object.entries(value).map(([k, v]) => [`metadata[${k}]`, v.toString()])
          }
          return [[key, value.toString()]]
        })
      )
    })
    
    if (!stripeResponse.ok) {
      const error = await stripeResponse.json()
      throw new Error(error.error?.message || 'Stripe API error')
    }
    
    const session = await stripeResponse.json()
    
    // Checkout Session IDを保存
    await DB.prepare(`
      UPDATE applications 
      SET stripe_checkout_session_id = ?
      WHERE id = ?
    `).bind(session.id, application_id).run()
    
    return c.json<ApiResponse>({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    })
  } catch (error) {
    console.error('Stripe Checkout Session Error:', error)
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Stripe Webhook処理
app.post('/api/payments/webhook', async (c) => {
  try {
    const { DB, STRIPE_WEBHOOK_SECRET } = c.env
    const body = await c.req.text()
    const signature = c.req.header('stripe-signature')
    
    if (!signature || !STRIPE_WEBHOOK_SECRET) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Webhook signature missing'
      }, 400)
    }
    
    // 注意: 本番環境ではStripe SDKを使って署名を検証すべきです
    // ここでは簡易実装として、イベントタイプのみ処理します
    const event = JSON.parse(body)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const applicationId = parseInt(session.client_reference_id)
      
      // 支払い成功を記録
      await DB.prepare(`
        UPDATE applications 
        SET payment_status = 'paid',
            payment_amount = ?,
            stripe_payment_intent_id = ?,
            paid_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        session.amount_total,
        session.payment_intent,
        applicationId
      ).run()
      
      // 支払い履歴を記録
      await DB.prepare(`
        INSERT INTO payment_transactions (application_id, transaction_type, amount, stripe_session_id, stripe_payment_intent_id, status)
        VALUES (?, 'payment', ?, ?, ?, 'completed')
      `).bind(
        applicationId,
        session.amount_total,
        session.id,
        session.payment_intent
      ).run()
    }
    
    return c.json<ApiResponse>({ success: true })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// 支払い状況確認API
app.get('/api/payments/status/:applicationId', async (c) => {
  try {
    const { DB } = c.env
    const applicationId = c.req.param('applicationId')
    
    const application = await DB.prepare(`
      SELECT payment_status, payment_amount, paid_at, ticket_code
      FROM applications
      WHERE id = ?
    `).bind(applicationId).first()
    
    if (!application) {
      return c.json<ApiResponse>({
        success: false,
        error: '申込情報が見つかりません'
      }, 404)
    }
    
    return c.json<ApiResponse>({
      success: true,
      data: application
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

// 支払いページ
app.get('/payment/:id', (c) => {
  return c.render(
    <div id="app"></div>
  )
})

// 支払い成功ページ
app.get('/payment-success', (c) => {
  return c.render(
    <div id="app"></div>
  )
})

// 支払いキャンセルページ
app.get('/payment-cancel', (c) => {
  return c.render(
    <div id="app"></div>
  )
})

export default app
