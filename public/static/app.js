// AI夜会・AI茶会 フロントエンドアプリケーション

class AIEventApp {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.allEvents = []; // 全イベントを保持
    this.currentArea = 'all'; // 現在選択中のエリア
    this.siteSettings = {}; // サイト設定を保持
    this.init();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/events/')) return 'event-detail';
    if (path.startsWith('/apply/')) return 'apply';
    if (path === '/admin') return 'admin';
    return 'home';
  }

  // 市町村からエリアを判定
  getAreaFromLocation(location) {
    // 東部の市町村
    const eastCities = ['沼津', '三島', '熱海', '伊東', '下田', '御殿場', '裾野', '伊豆'];
    // 中部の市町村
    const centralCities = ['静岡', '島田', '焼津', '藤枝', '牧之原', '吉田', '榛原', '川根'];
    // 西部の市町村
    const westCities = ['浜松', '磐田', '掛川', '袋井', '湖西', '御前崎', '菊川', '森'];

    if (eastCities.some(city => location.includes(city))) return '東部';
    if (centralCities.some(city => location.includes(city))) return '中部';
    if (westCities.some(city => location.includes(city))) return '西部';
    
    return '中部'; // デフォルトは中部
  }



  async init() {
    console.log('Current page:', this.currentPage);
    
    // サイト設定を読み込んでから各ページを表示
    await this.loadSiteSettingsData();
    
    switch (this.currentPage) {
      case 'home':
        this.renderHomePage();
        break;
      case 'event-detail':
        this.renderEventDetailPage();
        break;
      case 'apply':
        this.renderApplyPage();
        break;
      case 'admin':
        this.renderAdminPage();
        break;
    }
  }

  async loadSiteSettingsData() {
    try {
      const response = await axios.get('/api/settings');
      this.siteSettings = response.data.data;
      console.log('Site settings loaded:', this.siteSettings);
    } catch (error) {
      console.error('サイト設定の読み込みに失敗:', error);
      // デフォルト値を設定
      this.siteSettings = {
        site_title: 'AI夜会・AI茶会',
        site_subtitle: 'みんなでAIを語り合う交流の場',
        night_title: 'AI夜会',
        tea_title: 'AI茶会'
      };
    }
  }

  // ヘルパー関数：設定値を取得（デフォルト値付き）
  getSetting(key, defaultValue = '') {
    return this.siteSettings[key] || defaultValue;
  }

  // ============================================
  // ホームページ
  // ============================================
  async renderHomePage() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
      <!-- ヘッダー -->
      <header class="header-gradient text-white py-20 relative overflow-hidden">
        <div class="max-w-6xl mx-auto px-4 relative z-10">
          <div class="text-center">
            <!-- アニメーションアイコン -->
            <div class="mb-6 flex justify-center gap-8">
              <div class="floating-icon text-6xl opacity-80">🌙</div>
              <div class="floating-icon text-6xl opacity-80" style="animation-delay: 0.5s;">☕</div>
              <div class="floating-icon text-6xl opacity-80" style="animation-delay: 1s;">✨</div>
            </div>
            
            <h1 class="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              ${this.getSetting('site_title', 'AI夜会・AI茶会')}
            </h1>
            <p class="text-2xl md:text-3xl mb-6 font-semibold drop-shadow">
              ${this.getSetting('site_subtitle', 'みんなでAIを語り合う交流の場')}
            </p>
            <div class="flex flex-wrap justify-center gap-4 text-lg">
              <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                <i class="fas fa-map-marker-alt mr-2"></i>${this.getSetting('site_tagline_1', '静岡県内各地で開催')}
              </span>
              <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                <i class="fas fa-users mr-2"></i>${this.getSetting('site_tagline_2', '経営者・起業家・講師・学生歓迎')}
              </span>
              <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                <i class="fas fa-key mr-2"></i>${this.getSetting('site_tagline_3', '招待制・紹介制')}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 装飾要素 -->
        <div class="absolute top-10 left-10 text-6xl opacity-10 animate-spin" style="animation-duration: 20s;">⚙️</div>
        <div class="absolute bottom-10 right-10 text-6xl opacity-10 animate-spin" style="animation-duration: 15s;">🤖</div>
      </header>

      <!-- コンセプト -->
      <section class="py-16 bg-white relative">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-4xl font-bold text-gray-800 mb-12 text-center section-title">
            <i class="fas fa-lightbulb text-yellow-500 mr-3 floating-icon"></i>AI夜会・AI茶会とは
          </h2>
          <div class="grid md:grid-cols-2 gap-8 mb-12">
            <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl">
              <div class="flex items-start mb-4">
                <div class="text-5xl mr-4 mt-1">🌙</div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    ${this.getSetting('night_title', 'AI夜会')}
                    <span class="text-sm bg-indigo-500 text-white px-3 py-1 rounded-full">Night</span>
                  </h3>
                  <p class="text-gray-700 leading-relaxed">${this.getSetting('night_description', 'お酒を片手に、リラックスした雰囲気でAI活用について語り合います。実践事例の共有やプチコンサルティングも。')}</p>
                </div>
              </div>
              <div class="mt-4 flex gap-2 flex-wrap">
                <span class="text-xs bg-white px-3 py-1 rounded-full text-indigo-600 font-semibold">🍺 お酒OK</span>
                <span class="text-xs bg-white px-3 py-1 rounded-full text-indigo-600 font-semibold">💼 実践事例</span>
                <span class="text-xs bg-white px-3 py-1 rounded-full text-indigo-600 font-semibold">💡 相談OK</span>
              </div>
            </div>
            <div class="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-8 rounded-2xl shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl">
              <div class="flex items-start mb-4">
                <div class="text-5xl mr-4 mt-1">☕</div>
                <div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    ${this.getSetting('tea_title', 'AI茶会')}
                    <span class="text-sm bg-orange-500 text-white px-3 py-1 rounded-full">Tea</span>
                  </h3>
                  <p class="text-gray-700 leading-relaxed">${this.getSetting('tea_description', '落ち着いた雰囲気でお茶を楽しみながら、じっくりとAIについて深く語り合います。和やかな対話の時間。')}</p>
                </div>
              </div>
              <div class="mt-4 flex gap-2 flex-wrap">
                <span class="text-xs bg-white px-3 py-1 rounded-full text-orange-600 font-semibold">🍵 お茶・お菓子</span>
                <span class="text-xs bg-white px-3 py-1 rounded-full text-orange-600 font-semibold">🎋 和やか</span>
                <span class="text-xs bg-white px-3 py-1 rounded-full text-orange-600 font-semibold">💬 対話重視</span>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8 mt-12">
            <!-- このような方におすすめ -->
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg border-l-4 border-blue-500">
              <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-3xl mr-3">👥</span>
                こんな方におすすめ
              </h3>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <span class="text-2xl mr-3">💼</span>
                  <span>企業でAIを活用したい経営者・管理職の方</span>
                </li>
                <li class="flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <span class="text-2xl mr-3">🚀</span>
                  <span>これから起業したい、起業準備中の方</span>
                </li>
                <li class="flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <span class="text-2xl mr-3">👨‍🏫</span>
                  <span>AI講師として活動したい方、教室を運営している方</span>
                </li>
                <li class="flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <span class="text-2xl mr-3">🎓</span>
                  <span>AI活用を学びたい学生の方</span>
                </li>
                <li class="flex items-start bg-white p-3 rounded-lg shadow-sm">
                  <span class="text-2xl mr-3">📢</span>
                  <span>自分の事例をプレゼンしたい方</span>
                </li>
              </ul>
            </div>

            <!-- イベントの流れ -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border-l-4 border-green-500">
              <h3 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span class="text-3xl mr-3">📋</span>
                イベントの流れ
              </h3>
              <div class="space-y-4 text-gray-700">
                <div class="flex items-start bg-white p-4 rounded-lg shadow-sm">
                  <span class="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 font-bold shadow-lg text-lg">1</span>
                  <div>
                    <strong class="text-lg">ミニ講座</strong>
                    <div class="text-sm mt-1">⏱️ 約30分</div>
                    <span class="text-sm text-gray-600">AI講師による実践的なテーマの講座</span>
                  </div>
                </div>
                <div class="flex items-start bg-white p-4 rounded-lg shadow-sm">
                  <span class="bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 font-bold shadow-lg text-lg">2</span>
                  <div>
                    <strong class="text-lg">プレゼンタイム</strong>
                    <div class="text-sm mt-1">🎤 希望者のみ</div>
                    <span class="text-sm text-gray-600">あなたの事例や知見を共有できます</span>
                  </div>
                </div>
                <div class="flex items-start bg-white p-4 rounded-lg shadow-sm">
                  <span class="bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 font-bold shadow-lg text-lg">3</span>
                  <div>
                    <strong class="text-lg">交流・質疑応答</strong>
                    <div class="text-sm mt-1">💬 自由に対話</div>
                    <span class="text-sm text-gray-600">参加者同士の対話と個別相談</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- イベント一覧 -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 section-title">
            <i class="fas fa-calendar-alt text-blue-600 mr-2"></i>開催予定のイベント
          </h2>
          
          <div id="events-list">
            <div class="text-center py-12">
              <div class="loading mx-auto mb-4"></div>
              <p class="text-gray-600">イベント情報を読み込み中...</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 講師紹介 -->
      <section class="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-4xl font-bold text-gray-800 mb-12 text-center section-title">
            <span class="text-4xl mr-3">👨‍🏫</span>${this.getSetting('instructor_section_title', 'AI講師について')}
          </h2>
          <div class="bg-white p-10 rounded-2xl shadow-2xl border-t-4 border-purple-500">
            <div class="flex items-start gap-6 mb-6">
              <div class="text-6xl">✨</div>
              <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">${this.getSetting('instructor_section_subtitle', '実践的なAI活用をサポート')}</h3>
                <p class="text-gray-700 leading-relaxed text-lg mb-4">
                  ${this.getSetting('instructor_description_1', '私たちは企業向けAIコンサルティングや講座を提供している専門家チームです。実践的なAI活用支援を通じて、多くの企業の業務改善やDX推進をサポートしています。')}
                </p>
                <p class="text-gray-700 leading-relaxed text-lg">
                  ${this.getSetting('instructor_description_2', 'AI夜会・AI茶会では、参加者の皆様とフランクに対話しながら、それぞれの企業に合ったAI活用方法をご提案します。')}
                </p>
              </div>
            </div>
            <div class="grid md:grid-cols-3 gap-4 mt-8">
              <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl text-center">
                <div class="text-3xl mb-2">💼</div>
                <div class="font-bold text-gray-800">企業コンサル</div>
                <div class="text-sm text-gray-600 mt-1">AI導入支援</div>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center">
                <div class="text-3xl mb-2">📚</div>
                <div class="font-bold text-gray-800">AI講座</div>
                <div class="text-sm text-gray-600 mt-1">実践的な学習</div>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center">
                <div class="text-3xl mb-2">🤝</div>
                <div class="font-bold text-gray-800">個別相談</div>
                <div class="text-sm text-gray-600 mt-1">課題解決</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- お問い合わせ -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold text-gray-800 mb-6 section-title inline-block">
            <i class="fas fa-envelope text-blue-600 mr-2"></i>お問い合わせ
          </h2>
          <p class="text-gray-700 mb-8">
            ${this.getSetting('contact_description', 'イベントに関するご質問や、企業コンサル・講座のご相談はお気軽にお問い合わせください。')}
          </p>
          <a href="mailto:${this.getSetting('contact_email', 'info@ai-event.local')}" class="inline-block btn-primary text-white px-8 py-3 rounded-lg font-semibold">
            <i class="fas fa-paper-plane mr-2"></i>お問い合わせ
          </a>
        </div>
      </section>

      <!-- フッター -->
      <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-6xl mx-auto px-4 text-center">
          <p class="text-gray-400">${this.getSetting('footer_copyright', '© 2025 AI夜会・AI茶会. All rights reserved.')}</p>
          <p class="text-gray-500 text-sm mt-2">${this.getSetting('footer_tagline', '静岡県内でAI活用の輪を広げます')}</p>
        </div>
      </footer>
    `;

    // イベント一覧を取得して表示
    await this.loadEvents();
  }

  async loadEvents() {
    try {
      const response = await axios.get('/api/events?status=upcoming');
      this.allEvents = response.data.data;
      
      const eventsList = document.getElementById('events-list');
      
      if (this.allEvents.length === 0) {
        eventsList.innerHTML = `
          <div class="text-center py-12 bg-white rounded-lg">
            <i class="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-600 text-lg">現在、募集中のイベントはありません</p>
            <p class="text-gray-500 text-sm mt-2">新しいイベントは近日公開予定です</p>
          </div>
        `;
        return;
      }

      // エリア別に表示
      this.displayEventsByArea();
    } catch (error) {
      console.error('イベント取得エラー:', error);
      document.getElementById('events-list').innerHTML = `
        <div class="alert alert-error">
          <i class="fas fa-exclamation-circle mr-2"></i>
          イベント情報の取得に失敗しました
        </div>
      `;
    }
  }

  // エリア別にイベントを表示
  displayEventsByArea() {
    const eventsList = document.getElementById('events-list');
    
    // エリアごとにイベントを分類
    const eventsByArea = {
      '東部': [],
      '中部': [],
      '西部': []
    };

    this.allEvents.forEach(event => {
      const area = this.getAreaFromLocation(event.location);
      eventsByArea[area].push(event);
    });

    let html = '';

    // 各エリアのセクションを作成
    const areas = ['東部', '中部', '西部'];
    const areaInfo = {
      '東部': { icon: 'fa-map-marker-alt', color: 'orange', cities: '沼津・三島・熱海など' },
      '中部': { icon: 'fa-map-marker-alt', color: 'green', cities: '静岡・焼津・藤枝など' },
      '西部': { icon: 'fa-map-marker-alt', color: 'blue', cities: '浜松・磐田・掛川など' }
    };

    areas.forEach((area, index) => {
      const events = eventsByArea[area];
      const info = areaInfo[area];
      
      if (events.length > 0) {
        html += `
          <div class="mb-12 ${index > 0 ? 'mt-12' : ''}">
            <!-- エリアヘッダー -->
            <div class="flex items-center mb-6">
              <div class="flex items-center bg-${info.color}-100 text-${info.color}-700 px-6 py-3 rounded-lg">
                <i class="fas ${info.icon} text-2xl mr-3"></i>
                <div>
                  <h3 class="text-xl font-bold">${area}エリア</h3>
                  <p class="text-sm opacity-80">${info.cities}</p>
                </div>
              </div>
              <div class="flex-1 ml-4 h-1 bg-gradient-to-r from-${info.color}-200 to-transparent rounded"></div>
            </div>
            
            <!-- イベントカード -->
            <div class="grid md:grid-cols-2 gap-6">
              ${events.map(event => this.createEventCard(event)).join('')}
            </div>
          </div>
        `;
      }
    });

    if (html === '') {
      eventsList.innerHTML = `
        <div class="text-center py-12 bg-white rounded-lg">
          <i class="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-600 text-lg">現在、募集中のイベントはありません</p>
        </div>
      `;
    } else {
      eventsList.innerHTML = html;
    }
  }

  createEventCard(event) {
    const eventTypeClass = event.event_type === 'night' ? 'night' : 'tea';
    const eventTypeName = event.event_type === 'night' ? 'AI夜会' : 'AI茶会';
    const eventTypeIcon = event.event_type === 'night' ? 'fa-moon' : 'fa-mug-hot';
    const badgeClass = event.event_type === 'night' ? 'badge-night' : 'badge-tea';
    
    const eventDate = new Date(event.event_date);
    const dateStr = `${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;
    
    const remainingSeats = event.capacity - event.current_participants;
    const isAlmostFull = remainingSeats <= 3;

    // エリア判定
    const area = this.getAreaFromLocation(event.location);
    const areaColors = {
      '東部': 'bg-orange-100 text-orange-700',
      '中部': 'bg-green-100 text-green-700',
      '西部': 'bg-blue-100 text-blue-700'
    };

    return `
      <div class="event-card ${eventTypeClass} bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex gap-2">
              <span class="${badgeClass} text-white px-3 py-1 rounded-full text-sm font-semibold">
                <i class="fas ${eventTypeIcon} mr-1"></i>${eventTypeName}
              </span>
              <span class="${areaColors[area]} px-3 py-1 rounded-full text-sm font-semibold">
                <i class="fas fa-map-marker-alt mr-1"></i>${area}
              </span>
            </div>
            <div class="text-right">
              ${isAlmostFull ? '<span class="text-red-600 text-sm font-semibold"><i class="fas fa-exclamation-triangle mr-1"></i>残席わずか</span>' : ''}
            </div>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-2">${event.title}</h3>
          ${event.theme ? `<p class="text-lg text-blue-600 font-semibold mb-3"><i class="fas fa-lightbulb mr-2"></i>${event.theme}</p>` : ''}
          <p class="text-gray-600 mb-4 leading-relaxed">${event.description}</p>
          
          ${event.mini_lecture_topic ? `
          <div class="mb-4 bg-purple-50 p-3 rounded-lg">
            <p class="text-sm text-gray-700">
              <i class="fas fa-chalkboard-teacher text-purple-600 mr-2"></i>
              <strong>ミニ講座:</strong> ${event.mini_lecture_topic} ${event.mini_lecture_duration ? `(${event.mini_lecture_duration}分)` : ''}
            </p>
          </div>
          ` : ''}

          <div class="space-y-2 text-gray-700 mb-6">
            <div class="flex items-center">
              <i class="fas fa-calendar-day w-6 text-blue-600"></i>
              <span>${dateStr} ${event.start_time}${event.end_time ? ' 〜 ' + event.end_time : ''}</span>
            </div>
            <div class="flex items-center">
              <i class="fas fa-map-marker-alt w-6 text-red-600"></i>
              <span>${event.location}${event.address ? ' (' + event.address + ')' : ''}</span>
            </div>
            <div class="flex items-center">
              <i class="fas fa-users w-6 text-green-600"></i>
              <span>定員${event.capacity}名（残り${remainingSeats}席）</span>
            </div>
            ${event.payment_required && event.price > 0 ? `
            <div class="flex items-center">
              <i class="fas fa-yen-sign w-6 text-yellow-600"></i>
              <span class="font-bold text-lg text-yellow-700">参加費 ¥${event.price.toLocaleString()}（当日現地回収）</span>
            </div>
            ` : `
            <div class="flex items-center">
              <i class="fas fa-gift w-6 text-green-600"></i>
              <span class="font-bold text-green-700">無料</span>
            </div>
            `}
          </div>
          
          <div class="flex gap-3">
            <a href="/events/${event.id}" class="flex-1 text-center btn-primary text-white px-6 py-3 rounded-lg font-semibold">
              <i class="fas fa-info-circle mr-2"></i>詳細を見る
            </a>
            <a href="/apply/${event.id}" class="flex-1 text-center btn-secondary text-white px-6 py-3 rounded-lg font-semibold">
              <i class="fas fa-edit mr-2"></i>申し込む
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // イベント詳細ページ
  // ============================================
  async renderEventDetailPage() {
    const eventId = window.location.pathname.split('/').pop();
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <div class="text-center py-12">
          <div class="loading mx-auto mb-4"></div>
          <p class="text-gray-600">イベント情報を読み込み中...</p>
        </div>
      </div>
    `;

    try {
      const response = await axios.get(`/api/events/${eventId}`);
      const event = response.data.data;
      
      const eventTypeClass = event.event_type === 'night' ? 'night' : 'tea';
      const eventTypeName = event.event_type === 'night' ? 'AI夜会' : 'AI茶会';
      const eventTypeIcon = event.event_type === 'night' ? 'fa-moon' : 'fa-mug-hot';
      const badgeClass = event.event_type === 'night' ? 'badge-night' : 'badge-tea';
      
      const eventDate = new Date(event.event_date);
      const dateStr = `${eventDate.getFullYear()}年${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;
      
      const remainingSeats = event.capacity - event.current_participants;

      app.innerHTML = `
        <div class="min-h-screen bg-gray-50">
          <!-- ヘッダー -->
          <header class="header-gradient text-white py-8">
            <div class="max-w-4xl mx-auto px-4">
              <a href="/" class="text-white hover:text-gray-200 mb-4 inline-block">
                <i class="fas fa-arrow-left mr-2"></i>イベント一覧に戻る
              </a>
              <h1 class="text-3xl md:text-4xl font-bold">
                <i class="fas ${eventTypeIcon} mr-2"></i>${event.title}
              </h1>
            </div>
          </header>

          <!-- 本文 -->
          <div class="max-w-4xl mx-auto px-4 py-12">
            <div class="bg-white rounded-lg shadow-md p-8 mb-8">
              <div class="mb-6">
                <span class="${badgeClass} text-white px-4 py-2 rounded-full text-sm font-semibold">
                  <i class="fas ${eventTypeIcon} mr-1"></i>${eventTypeName}
                </span>
              </div>

              ${event.theme ? `
              <div class="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 class="text-xl font-bold text-gray-800 mb-2">
                  <i class="fas fa-lightbulb text-purple-600 mr-2"></i>今回のテーマ
                </h3>
                <p class="text-lg text-gray-700">${event.theme}</p>
              </div>
              ` : ''}

              <p class="text-gray-700 text-lg leading-relaxed mb-6">${event.description}</p>

              ${event.target_audience ? `
              <div class="mb-6 bg-green-50 p-4 rounded-lg">
                <p class="text-gray-700">
                  <i class="fas fa-user-check text-green-600 mr-2"></i>
                  <strong>参加対象:</strong> ${event.target_audience}
                </p>
              </div>
              ` : ''}

              ${event.mini_lecture_topic ? `
              <div class="mb-6 bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                <h3 class="text-lg font-bold text-gray-800 mb-2">
                  <i class="fas fa-chalkboard-teacher text-yellow-600 mr-2"></i>ミニ講座
                </h3>
                <p class="text-gray-700"><strong>${event.mini_lecture_topic}</strong></p>
                ${event.mini_lecture_duration ? `<p class="text-sm text-gray-600 mt-1">所要時間: 約${event.mini_lecture_duration}分</p>` : ''}
              </div>
              ` : ''}

              ${event.program_details ? `
              <div class="mb-6 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 class="text-lg font-bold text-gray-800 mb-3">
                  <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>プログラム
                </h3>
                <div class="text-gray-700 whitespace-pre-line text-sm leading-relaxed">${event.program_details}</div>
              </div>
              ` : ''}

              ${event.staff && event.staff.length > 0 ? `
              <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-users text-blue-600 mr-2"></i>講師・スタッフ
                </h3>
                <div class="space-y-4">
                  ${event.staff.map(staff => `
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <div class="flex items-start gap-3">
                        <div class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                          <i class="fas ${staff.role === 'lecturer' ? 'fa-chalkboard-teacher' : staff.role === 'facilitator' ? 'fa-comments' : 'fa-user'}"></i>
                        </div>
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <h4 class="text-lg font-bold text-gray-800">${staff.name}</h4>
                            <span class="text-xs px-2 py-1 rounded-full ${
                              staff.role === 'lecturer' ? 'bg-purple-100 text-purple-700' :
                              staff.role === 'facilitator' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }">
                              ${staff.role === 'lecturer' ? '講師' : staff.role === 'facilitator' ? 'ファシリテーター' : 'スタッフ'}
                            </span>
                          </div>
                          ${staff.bio ? `<p class="text-sm text-gray-600">${staff.bio}</p>` : ''}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
              ` : ''}

              <div class="space-y-4 bg-gray-50 p-6 rounded-lg mb-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-info-circle text-blue-600 mr-2"></i>開催情報
                </h3>
                <div class="flex items-center text-gray-700">
                  <i class="fas fa-calendar-day w-8 text-blue-600"></i>
                  <div>
                    <strong>開催日時：</strong>
                    ${dateStr} ${event.start_time}${event.end_time ? ' 〜 ' + event.end_time : ''}
                  </div>
                </div>
                <div class="flex items-center text-gray-700">
                  <i class="fas fa-map-marker-alt w-8 text-red-600"></i>
                  <div>
                    <strong>会場：</strong>
                    ${event.location}${event.address ? '<br><span class="text-sm text-gray-600">' + event.address + '</span>' : ''}
                  </div>
                </div>
                <div class="flex items-center text-gray-700">
                  <i class="fas fa-users w-8 text-green-600"></i>
                  <div>
                    <strong>定員：</strong>
                    ${event.capacity}名（残り${remainingSeats}席）
                  </div>
                </div>
                <div class="flex items-center text-gray-700">
                  <i class="fas fa-yen-sign w-8 ${event.payment_required && event.price > 0 ? 'text-yellow-600' : 'text-green-600'}"></i>
                  <div>
                    <strong>参加費：</strong>
                    ${event.payment_required && event.price > 0 ? `<span class="text-2xl font-bold text-yellow-700">¥${event.price.toLocaleString()}</span><span class="text-sm text-gray-600 ml-2">（当日現地回収）</span>` : '<span class="text-xl font-bold text-green-700">無料</span>'}
                  </div>
                </div>
              </div>

              <div class="mt-8 flex gap-4">
                <a href="/apply/${event.id}" class="flex-1 text-center btn-secondary text-white px-8 py-4 rounded-lg font-semibold text-lg">
                  <i class="fas fa-edit mr-2"></i>このイベントに申し込む
                </a>
              </div>
            </div>

            <div class="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
              <h3 class="text-lg font-bold text-gray-800 mb-2">
                <i class="fas fa-key text-blue-600 mr-2"></i>招待制イベントです
              </h3>
              <p class="text-gray-700">
                このイベントは招待制・紹介制となっております。<br>
                お申し込みには招待コードが必要です。
              </p>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error('イベント取得エラー:', error);
      app.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
          <div class="max-w-md mx-auto px-4 text-center">
            <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">イベントが見つかりません</h2>
            <p class="text-gray-600 mb-8">指定されたイベントは存在しないか、公開されていません。</p>
            <a href="/" class="btn-primary text-white px-6 py-3 rounded-lg font-semibold inline-block">
              <i class="fas fa-arrow-left mr-2"></i>トップページに戻る
            </a>
          </div>
        </div>
      `;
    }
  }

  // ============================================
  // 申込フォームページ
  // ============================================
  async renderApplyPage() {
    const eventId = window.location.pathname.split('/').pop();
    const app = document.getElementById('app');

    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <div class="text-center py-12">
          <div class="loading mx-auto mb-4"></div>
          <p class="text-gray-600">フォームを準備中...</p>
        </div>
      </div>
    `;

    try {
      const response = await axios.get(`/api/events/${eventId}`);
      const event = response.data.data;

      app.innerHTML = `
        <div class="min-h-screen bg-gray-50">
          <!-- ヘッダー -->
          <header class="header-gradient text-white py-8">
            <div class="max-w-4xl mx-auto px-4">
              <a href="/events/${eventId}" class="text-white hover:text-gray-200 mb-4 inline-block">
                <i class="fas fa-arrow-left mr-2"></i>イベント詳細に戻る
              </a>
              <h1 class="text-3xl md:text-4xl font-bold">
                <i class="fas fa-edit mr-2"></i>参加申込フォーム
              </h1>
              <p class="text-lg mt-2 opacity-90">${event.title}</p>
            </div>
          </header>

          <!-- フォーム -->
          <div class="max-w-4xl mx-auto px-4 py-12">
            <div id="alert-container"></div>

            <form id="apply-form" class="bg-white rounded-lg shadow-md p-8">
              <div class="mb-8 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p class="text-gray-700">
                  <i class="fas fa-info-circle text-yellow-600 mr-2"></i>
                  このイベントは招待制です。お申し込みには招待コードが必要です。
                </p>
              </div>

              <!-- 招待コード -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  招待コード <span class="text-red-600">*</span>
                </label>
                <input type="text" id="invitation_code" name="invitation_code" required
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="招待コードを入力してください">
                <p class="text-sm text-gray-500 mt-1">
                  <i class="fas fa-key mr-1"></i>招待コードをお持ちでない方は、紹介者にお問い合わせください
                </p>
              </div>

              <hr class="my-8">

              <!-- 参加者タイプ -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  参加者タイプ <span class="text-red-600">*</span>
                </label>
                <select id="participant_type" name="participant_type" required
                  class="form-input w-full px-4 py-3 rounded-lg">
                  <option value="">選択してください</option>
                  <option value="business_owner">経営者・管理職</option>
                  <option value="aspiring_entrepreneur">起業準備中・起業したい方</option>
                  <option value="teacher">AI講師・教室運営者</option>
                  <option value="student">学生</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <!-- 会社名・所属 -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  会社名・所属 <span class="text-red-600">*</span>
                </label>
                <input type="text" id="company_name" name="company_name" required
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="株式会社〇〇、個人、〇〇大学など">
                <p class="text-sm text-gray-500 mt-1">
                  個人の方は「個人」とご記入ください
                </p>
              </div>

              <!-- お名前 -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  お名前 <span class="text-red-600">*</span>
                </label>
                <input type="text" id="applicant_name" name="applicant_name" required
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="山田 太郎">
              </div>

              <!-- 役職・立場 -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  役職・立場
                </label>
                <input type="text" id="position" name="position"
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="代表取締役、講師、学生など">
              </div>

              <!-- メールアドレス -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  メールアドレス <span class="text-red-600">*</span>
                </label>
                <input type="email" id="email" name="email" required
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="example@company.com">
              </div>

              <!-- 電話番号 -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  電話番号
                </label>
                <input type="tel" id="phone" name="phone"
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="090-1234-5678">
              </div>

              <!-- AI活用状況 -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  現在のAI活用状況
                </label>
                <textarea id="ai_usage_examples" name="ai_usage_examples" rows="4"
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="例：ChatGPTを業務で活用中、社内ナレッジベース構築など"></textarea>
                <p class="text-sm text-gray-500 mt-1">
                  まだ導入していない場合は「未導入」とご記入ください
                </p>
              </div>

              <!-- 相談したいこと -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  相談したいテーマ・知りたいこと
                </label>
                <textarea id="consultation_topics" name="consultation_topics" rows="4"
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="例：営業支援AIの導入方法、コスト削減につながる活用事例など"></textarea>
              </div>

              <!-- 紹介者名 -->
              <div class="mb-8">
                <label class="block text-gray-700 font-semibold mb-2">
                  紹介者のお名前
                </label>
                <input type="text" id="referrer_name" name="referrer_name"
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="紹介者がいる場合はご記入ください">
              </div>

              <div class="flex gap-4">
                <button type="submit" id="submit-btn"
                  class="flex-1 btn-primary text-white px-8 py-4 rounded-lg font-semibold text-lg">
                  <i class="fas fa-paper-plane mr-2"></i>申し込む
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      // フォーム送信処理
      document.getElementById('apply-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleApplySubmit(eventId);
      });

    } catch (error) {
      console.error('イベント取得エラー:', error);
      app.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
          <div class="max-w-md mx-auto px-4 text-center">
            <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">エラー</h2>
            <p class="text-gray-600 mb-8">イベント情報の取得に失敗しました。</p>
            <a href="/" class="btn-primary text-white px-6 py-3 rounded-lg font-semibold inline-block">
              <i class="fas fa-arrow-left mr-2"></i>トップページに戻る
            </a>
          </div>
        </div>
      `;
    }
  }

  async handleApplySubmit(eventId) {
    const submitBtn = document.getElementById('submit-btn');
    const alertContainer = document.getElementById('alert-container');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading mr-2"></div>送信中...';

    try {
      const formData = {
        event_id: parseInt(eventId),
        invitation_code: document.getElementById('invitation_code').value.trim(),
        participant_type: document.getElementById('participant_type').value,
        company_name: document.getElementById('company_name').value.trim(),
        applicant_name: document.getElementById('applicant_name').value.trim(),
        position: document.getElementById('position').value.trim() || null,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        ai_usage_examples: document.getElementById('ai_usage_examples').value.trim() || null,
        consultation_topics: document.getElementById('consultation_topics').value.trim() || null,
        referrer_name: document.getElementById('referrer_name').value.trim() || null
      };

      const response = await axios.post('/api/applications', formData);

      if (response.data.success) {
        alertContainer.innerHTML = `
          <div class="alert alert-success">
            <i class="fas fa-check-circle mr-2"></i>
            ${response.data.message}
          </div>
        `;
        document.getElementById('apply-form').reset();
        window.scrollTo(0, 0);
        
        // 3秒後にトップページへ
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    } catch (error) {
      console.error('申込エラー:', error);
      const errorMsg = error.response?.data?.error || '申込処理に失敗しました';
      alertContainer.innerHTML = `
        <div class="alert alert-error">
          <i class="fas fa-exclamation-circle mr-2"></i>
          ${errorMsg}
        </div>
      `;
      window.scrollTo(0, 0);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>申し込む';
    }
  }

  // ============================================
  // 支払いページ
  // ============================================
  async renderPaymentPage() {
    const app = document.getElementById('app');
    const path = window.location.pathname;
    const applicationId = path.split('/')[2];

    try {
      const response = await axios.get(`/api/applications/${applicationId}`);
      const application = response.data.data;

      app.innerHTML = `
        <div class="min-h-screen bg-gray-50">
          <header class="header-gradient text-white py-12">
            <div class="max-w-4xl mx-auto px-4">
              <h1 class="text-3xl font-bold mb-2">
                <i class="fas fa-credit-card mr-2"></i>お支払い
              </h1>
              <p class="text-gray-100">イベント参加費のお支払いページです</p>
            </div>
          </header>

          <div class="max-w-4xl mx-auto px-4 py-12">
            <div class="bg-white rounded-lg shadow-md p-8">
              <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">申込内容</h2>
                <div class="space-y-2 text-gray-700">
                  <p><strong>イベント名:</strong> ${application.event.title}</p>
                  <p><strong>お名前:</strong> ${application.applicant_name}</p>
                  <p><strong>メールアドレス:</strong> ${application.email}</p>
                  <p class="text-3xl font-bold text-blue-600 mt-4">
                    参加費: ¥${application.payment_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div class="border-t pt-6">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                  <i class="fas fa-shield-alt text-green-600 mr-2"></i>安全な決済
                </h3>
                <p class="text-gray-600 mb-6">
                  Stripeの安全な決済システムを使用しています。クレジットカード情報は当サイトには保存されません。
                </p>

                <button id="checkout-btn" class="w-full btn-primary text-white px-8 py-4 rounded-lg font-semibold text-lg">
                  <i class="fas fa-lock mr-2"></i>Stripeで支払う
                </button>
              </div>

              <div class="mt-6 text-center">
                <a href="/" class="text-blue-600 hover:underline">
                  <i class="fas fa-arrow-left mr-1"></i>トップページへ戻る
                </a>
              </div>
            </div>
          </div>
        </div>
      `;

      // 支払いボタンのイベントリスナー
      document.getElementById('checkout-btn').addEventListener('click', async () => {
        const btn = document.getElementById('checkout-btn');
        btn.disabled = true;
        btn.innerHTML = '<div class="loading mr-2"></div>処理中...';

        try {
          const response = await axios.post('/api/payments/create-checkout-session', {
            application_id: parseInt(applicationId)
          });

          if (response.data.success && response.data.data.url) {
            window.location.href = response.data.data.url;
          }
        } catch (error) {
          console.error('支払いエラー:', error);
          alert('支払い処理でエラーが発生しました: ' + (error.response?.data?.error || 'エラー'));
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-lock mr-2"></i>Stripeで支払う';
        }
      });

    } catch (error) {
      console.error('申込情報の取得エラー:', error);
      app.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center">
          <div class="text-center">
            <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">エラー</h2>
            <p class="text-gray-600 mb-6">申込情報が見つかりませんでした</p>
            <a href="/" class="btn-primary text-white px-6 py-3 rounded-lg">
              トップページへ戻る
            </a>
          </div>
        </div>
      `;
    }
  }

  async renderPaymentSuccessPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center max-w-md mx-auto px-4">
          <div class="mb-6 floating-icon" style="font-size: 120px;">🎉</div>
          <h1 class="text-4xl font-bold text-gray-800 mb-4">お支払い完了！</h1>
          <p class="text-gray-600 mb-8">
            ご参加ありがとうございます！<br>
            登録されたメールアドレスに確認メールを送信しました。
          </p>
          <a href="/" class="btn-primary text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block">
            <i class="fas fa-home mr-2"></i>トップページへ戻る
          </a>
        </div>
      </div>
    `;
  }

  async renderPaymentCancelPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center max-w-md mx-auto px-4">
          <div class="mb-6" style="font-size: 120px;">❌</div>
          <h1 class="text-4xl font-bold text-gray-800 mb-4">お支払いキャンセル</h1>
          <p class="text-gray-600 mb-8">
            お支払いがキャンセルされました。<br>
            再度お支払いを行う場合は、申込履歴から進めてください。
          </p>
          <a href="/" class="btn-primary text-white px-8 py-4 rounded-lg font-semibold text-lg inline-block">
            <i class="fas fa-home mr-2"></i>トップページへ戻る
          </a>
        </div>
      </div>
    `;
  }

  // ============================================
  // 管理画面（簡易版）
  // ============================================
  async renderAdminPage() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- ヘッダー -->
        <header class="header-gradient text-white py-8">
          <div class="max-w-6xl mx-auto px-4">
            <h1 class="text-3xl md:text-4xl font-bold">
              <i class="fas fa-cog mr-2"></i>管理画面
            </h1>
            <a href="/" class="text-white hover:text-gray-200 mt-2 inline-block">
              <i class="fas fa-arrow-left mr-2"></i>トップページに戻る
            </a>
          </div>
        </header>

        <div class="max-w-6xl mx-auto px-4 py-12">
          <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 text-center border-t-4 border-blue-500 hover:shadow-lg transition">
              <i class="fas fa-calendar-alt text-5xl text-blue-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">イベント管理</h3>
              <p class="text-gray-600 mb-4 text-sm">イベントの作成・編集</p>
              <div class="flex flex-col gap-2">
                <button onclick="app.showEventForm()" class="btn-primary text-white px-4 py-2 rounded-lg text-sm">
                  <i class="fas fa-plus mr-2"></i>新規作成
                </button>
                <button onclick="app.loadEventsList()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition">
                  <i class="fas fa-list mr-2"></i>一覧表示
                </button>
              </div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 text-center border-t-4 border-green-500 hover:shadow-lg transition">
              <i class="fas fa-key text-5xl text-green-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">招待コード</h3>
              <p class="text-gray-600 mb-4 text-sm">コード生成・管理</p>
              <div class="flex flex-col gap-2">
                <button onclick="app.showCodeForm()" class="btn-primary text-white px-4 py-2 rounded-lg text-sm">
                  <i class="fas fa-plus mr-2"></i>新規作成
                </button>
                <button onclick="app.loadInvitationCodes()" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition">
                  <i class="fas fa-list mr-2"></i>一覧表示
                </button>
              </div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 text-center border-t-4 border-purple-500 hover:shadow-lg transition">
              <i class="fas fa-users text-5xl text-purple-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">申込管理</h3>
              <p class="text-gray-600 mb-4 text-sm">参加申込の確認</p>
              <button onclick="app.loadApplications()" class="btn-primary text-white px-4 py-2 rounded-lg w-full">
                <i class="fas fa-list mr-2"></i>一覧表示
              </button>
            </div>
            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-md p-6 text-center border-t-4 border-orange-500 hover:shadow-lg transition">
              <i class="fas fa-cog text-5xl text-orange-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">サイト設定</h3>
              <p class="text-gray-600 mb-4 text-sm">文言・表示内容の編集</p>
              <button onclick="app.loadSiteSettings()" class="btn-primary text-white px-4 py-2 rounded-lg w-full">
                <i class="fas fa-edit mr-2"></i>設定編集
              </button>
            </div>
            <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg shadow-md p-6 text-center border-t-4 border-yellow-500 hover:shadow-lg transition">
              <i class="fas fa-chalkboard-teacher text-5xl text-yellow-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">講師管理</h3>
              <p class="text-gray-600 mb-4 text-sm">講師情報の管理</p>
              <button onclick="alert('講師管理機能は今後実装予定です')" class="bg-gray-400 text-white px-4 py-2 rounded-lg w-full cursor-not-allowed">
                <i class="fas fa-lock mr-2"></i>近日公開
              </button>
            </div>
          </div>

          <div id="admin-content" class="bg-white rounded-lg shadow-md p-8">
            <p class="text-gray-600 text-center">機能を選択してください</p>
          </div>
        </div>
      </div>
    `;
  }

  showEventForm() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <h2 class="text-3xl font-bold text-gray-800 mb-8 flex items-center">
        <span class="text-4xl mr-3">📅</span>
        新規イベント作成
      </h2>

      <!-- テンプレート選択 -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span class="text-2xl mr-2">📋</span>テンプレートから作成
        </h3>
        <p class="text-gray-600 mb-4 text-sm">よく使うイベント形式を選択して、自動入力できます</p>
        <div class="grid md:grid-cols-3 gap-4">
          <button type="button" onclick="app.applyEventTemplate('night_basic')" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
            <i class="fas fa-moon mr-2"></i>AI夜会（基本）
          </button>
          <button type="button" onclick="app.applyEventTemplate('tea_basic')" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition">
            <i class="fas fa-mug-hot mr-2"></i>AI茶会（基本）
          </button>
          <button type="button" onclick="app.applyEventTemplate('workshop')" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition">
            <i class="fas fa-chalkboard-teacher mr-2"></i>ワークショップ
          </button>
        </div>
      </div>

      <form id="event-form" class="space-y-8">
        <!-- 基本情報 -->
        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="text-2xl mr-2">📝</span>基本情報
          </h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">イベント名 *</label>
              <input type="text" name="title" required class="form-input w-full px-4 py-3 rounded-lg" placeholder="AI夜会 Vol.1 浜松">
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">イベントタイプ *</label>
              <select name="event_type" required class="form-input w-full px-4 py-3 rounded-lg">
                <option value="night">🌙 AI夜会</option>
                <option value="tea">☕ AI茶会</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-gray-700 font-semibold mb-2">説明 *</label>
            <textarea name="description" required rows="3" class="form-input w-full px-4 py-3 rounded-lg" placeholder="イベントの簡単な説明を入力してください"></textarea>
          </div>
        </div>

        <!-- テーマ・プログラム -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="text-2xl mr-2">💡</span>テーマ・プログラム
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">イベントテーマ</label>
              <input type="text" name="theme" class="form-input w-full px-4 py-3 rounded-lg" placeholder="ChatGPTで変わる業務効率化">
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">ミニ講座トピック</label>
              <input type="text" name="mini_lecture_topic" class="form-input w-full px-4 py-3 rounded-lg" placeholder="ChatGPTを活用した実務改善の具体例">
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">ミニ講座時間（分）</label>
              <input type="number" name="mini_lecture_duration" class="form-input w-full px-4 py-3 rounded-lg" value="30" min="15" max="60">
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">プログラム詳細（改行可）</label>
              <textarea name="program_details" rows="5" class="form-input w-full px-4 py-3 rounded-lg" placeholder="18:30 受付開始
19:00 ミニ講座（30分）
19:30 交流タイム
20:30 質疑応答
21:00 終了"></textarea>
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">参加対象者</label>
              <input type="text" name="target_audience" class="form-input w-full px-4 py-3 rounded-lg" placeholder="経営者、起業準備中の方、AIに興味がある方、どなたでも歓迎">
            </div>
          </div>
        </div>

        <!-- 開催情報 -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="text-2xl mr-2">📍</span>開催情報
          </h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">開催地 *</label>
              <input type="text" name="location" required class="form-input w-full px-4 py-3 rounded-lg" placeholder="浜松市">
              <p class="text-xs text-gray-500 mt-1">市町村名を入力（エリア自動判定）</p>
            </div>
            <div>
              <label class="block text-gray-700 font-semibold mb-2">住所</label>
              <input type="text" name="address" class="form-input w-full px-4 py-3 rounded-lg" placeholder="浜松市中区〇〇町1-2-3">
            </div>
          </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">開催日</label>
            <input type="date" name="event_date" required class="form-input w-full px-4 py-2 rounded-lg">
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">開始時刻</label>
            <input type="time" name="start_time" required class="form-input w-full px-4 py-2 rounded-lg">
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">終了時刻</label>
            <input type="time" name="end_time" class="form-input w-full px-4 py-2 rounded-lg">
          </div>
          <div class="mt-4">
            <label class="block text-gray-700 font-semibold mb-2">定員 *</label>
            <input type="number" name="capacity" value="20" required min="1" class="form-input w-full px-4 py-3 rounded-lg">
          </div>
        </div>
        </div>

        <!-- 参加費設定 -->
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl">
          <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span class="text-2xl mr-2">💰</span>参加費設定
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">参加費（円）</label>
              <input type="number" name="price" value="0" min="0" class="form-input w-full px-4 py-3 rounded-lg" placeholder="0">
              <p class="text-xs text-gray-500 mt-1">0円の場合は無料イベントになります（当日現地回収）</p>
            </div>
          </div>
        </div>

        <!-- 送信ボタン -->
        <div class="flex gap-4">
          <button type="submit" class="flex-1 btn-primary text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
            <i class="fas fa-save mr-2"></i>イベントを作成
          </button>
          <button type="button" onclick="app.loadEventsList()" class="btn-secondary text-white px-6 py-4 rounded-lg font-semibold">
            <i class="fas fa-list mr-2"></i>一覧表示
          </button>
        </div>
      </form>
    `;

    document.getElementById('event-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading mr-2"></div>作成中...';
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      try {
        const response = await axios.post('/api/admin/events', data);
        
        // 成功メッセージ
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success mb-6 animate-fade-in';
        successMsg.innerHTML = `
          <i class="fas fa-check-circle mr-2"></i>
          イベント「${data.title}」を作成しました！
        `;
        content.insertBefore(successMsg, content.firstChild);
        
        e.target.reset();
        
        // 3秒後にメッセージを消す
        setTimeout(() => successMsg.remove(), 5000);
      } catch (error) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'alert alert-error mb-6 animate-fade-in';
        errorMsg.innerHTML = `
          <i class="fas fa-exclamation-circle mr-2"></i>
          エラー: ${error.response?.data?.error || 'イベント作成に失敗しました'}
        `;
        content.insertBefore(errorMsg, content.firstChild);
        
        setTimeout(() => errorMsg.remove(), 5000);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>イベントを作成';
      }
    });
  }

  applyEventTemplate(templateType) {
    const templates = {
      night_basic: {
        title: 'AI夜会 Vol.X',
        event_type: 'night',
        description: '浜松で開催するAI活用交流会。お酒を片手にAIについて語り合います。',
        theme: 'ChatGPTで変わる業務効率化',
        mini_lecture_topic: 'ChatGPTを活用した実務改善の具体例',
        mini_lecture_duration: '30',
        program_details: `18:30 受付開始
19:00 オープニング・自己紹介
19:15 ミニ講座（30分）
19:45 交流タイム
20:30 質疑応答
21:00 終了`,
        target_audience: '経営者、起業準備中の方、AIに興味がある方',
        location: '浜松市',
        address: '浜松市中区板屋町111-2',
        start_time: '18:30',
        end_time: '21:00',
        capacity: '20',
        price: '3000'
      },
      tea_basic: {
        title: 'AI茶会 Vol.X',
        event_type: 'tea',
        description: '昼間に開催するカジュアルなAI勉強会。お茶を飲みながら気軽に学べます。',
        theme: 'AI初心者のための入門講座',
        mini_lecture_topic: 'ChatGPTの基本的な使い方',
        mini_lecture_duration: '30',
        program_details: `13:30 受付開始
14:00 オープニング
14:15 ミニ講座（30分）
14:45 休憩
15:00 ハンズオン体験
15:45 質疑応答
16:00 終了`,
        target_audience: 'AI初心者、学生、教育関係者、どなたでも歓迎',
        location: '静岡市',
        address: '静岡市葵区〇〇町1-2-3',
        start_time: '14:00',
        end_time: '16:00',
        capacity: '15',
        price: '1000'
      },
      workshop: {
        title: 'AIワークショップ Vol.X',
        event_type: 'tea',
        description: '実践的なAI活用ワークショップ。実際に手を動かしながら学びます。',
        theme: 'ChatGPT活用実践ワークショップ',
        mini_lecture_topic: 'プロンプトエンジニアリングの基礎',
        mini_lecture_duration: '45',
        program_details: `10:00 受付開始
10:15 イントロダクション
10:30 講義（45分）
11:15 休憩
11:30 ハンズオン実習
12:30 ランチ休憩
13:30 グループワーク
15:00 発表・フィードバック
16:00 終了`,
        target_audience: '実務でAIを活用したい方、中級者向け',
        location: '沼津市',
        address: '沼津市大手町1-1-1',
        start_time: '10:00',
        end_time: '16:00',
        capacity: '12',
        price: '5000'
      }
    };

    const template = templates[templateType];
    if (!template) return;

    // フォームに値を設定
    const form = document.getElementById('event-form');
    form.querySelector('[name="title"]').value = template.title;
    form.querySelector('[name="event_type"]').value = template.event_type;
    form.querySelector('[name="description"]').value = template.description;
    form.querySelector('[name="theme"]').value = template.theme;
    form.querySelector('[name="mini_lecture_topic"]').value = template.mini_lecture_topic;
    form.querySelector('[name="mini_lecture_duration"]').value = template.mini_lecture_duration;
    form.querySelector('[name="program_details"]').value = template.program_details;
    form.querySelector('[name="target_audience"]').value = template.target_audience;
    form.querySelector('[name="location"]').value = template.location;
    form.querySelector('[name="address"]').value = template.address;
    form.querySelector('[name="start_time"]').value = template.start_time;
    form.querySelector('[name="end_time"]').value = template.end_time;
    form.querySelector('[name="capacity"]').value = template.capacity;
    form.querySelector('[name="price"]').value = template.price;

    // 成功メッセージ
    const msg = document.createElement('div');
    msg.className = 'alert alert-success mb-6 animate-fade-in';
    msg.innerHTML = `<i class="fas fa-check-circle mr-2"></i>テンプレート「${template.title}」を適用しました！日付と必要に応じて内容を調整してください。`;
    form.parentElement.insertBefore(msg, form);
    setTimeout(() => msg.remove(), 5000);
    
    // フォームの先頭にスクロール
    form.scrollIntoView({ behavior: 'smooth' });
  }

  showCodeForm() {
    const content = document.getElementById('admin-content');
    content.innerHTML = `
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        <i class="fas fa-key text-green-600 mr-2"></i>招待コード作成
      </h2>
      <form id="code-form" class="space-y-6">
        <div>
          <label class="block text-gray-700 font-semibold mb-2">招待コード</label>
          <input type="text" name="code" required class="form-input w-full px-4 py-2 rounded-lg" placeholder="EXAMPLE2025">
        </div>
        <div>
          <label class="block text-gray-700 font-semibold mb-2">最大使用回数</label>
          <input type="number" name="max_uses" value="10" required class="form-input w-full px-4 py-2 rounded-lg">
        </div>
        <div>
          <label class="block text-gray-700 font-semibold mb-2">有効期限</label>
          <input type="datetime-local" name="expires_at" class="form-input w-full px-4 py-2 rounded-lg">
        </div>
        <div>
          <label class="block text-gray-700 font-semibold mb-2">備考</label>
          <textarea name="notes" rows="3" class="form-input w-full px-4 py-2 rounded-lg"></textarea>
        </div>
        <button type="submit" class="btn-primary text-white px-8 py-3 rounded-lg font-semibold">
          <i class="fas fa-save mr-2"></i>招待コードを作成
        </button>
      </form>
    `;

    document.getElementById('code-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading mr-2"></div>作成中...';
      
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      try {
        await axios.post('/api/admin/invitation-codes', data);
        
        const successMsg = document.createElement('div');
        successMsg.className = 'alert alert-success mb-6 animate-fade-in';
        successMsg.innerHTML = `
          <i class="fas fa-check-circle mr-2"></i>
          招待コード「${data.code}」を作成しました！
        `;
        content.insertBefore(successMsg, content.firstChild);
        
        e.target.reset();
        setTimeout(() => successMsg.remove(), 5000);
      } catch (error) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'alert alert-error mb-6 animate-fade-in';
        errorMsg.innerHTML = `
          <i class="fas fa-exclamation-circle mr-2"></i>
          エラー: ${error.response?.data?.error || '招待コード作成に失敗しました'}
        `;
        content.insertBefore(errorMsg, content.firstChild);
        setTimeout(() => errorMsg.remove(), 5000);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>招待コードを作成';
      }
    });
  }

  async loadEventsList() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="text-center py-8"><div class="loading mx-auto"></div><p class="text-gray-600 mt-4">イベントを読み込み中...</p></div>';

    try {
      const response = await axios.get('/api/events');
      const events = response.data.data;

      if (events.length === 0) {
        content.innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-600 text-lg mb-4">イベントがまだありません</p>
            <button onclick="app.showEventForm()" class="btn-primary text-white px-6 py-3 rounded-lg">
              <i class="fas fa-plus mr-2"></i>新規イベントを作成
            </button>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-bold text-gray-800 flex items-center">
            <span class="text-4xl mr-3">📋</span>
            イベント一覧
          </h2>
          <button onclick="app.showEventForm()" class="btn-primary text-white px-4 py-2 rounded-lg">
            <i class="fas fa-plus mr-2"></i>新規作成
          </button>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          ${events.map(event => `
            <div class="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md p-6 border-l-4 ${
              event.event_type === 'night' ? 'border-indigo-500' : 'border-orange-500'
            }">
              <div class="flex items-start justify-between mb-3">
                <span class="${event.event_type === 'night' ? 'badge-night' : 'badge-tea'} text-white px-3 py-1 rounded-full text-sm">
                  <i class="fas ${event.event_type === 'night' ? 'fa-moon' : 'fa-mug-hot'} mr-1"></i>
                  ${event.event_type === 'night' ? 'AI夜会' : 'AI茶会'}
                </span>
                <span class="px-3 py-1 rounded-full text-sm ${
                  event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                  event.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }">
                  ${event.status === 'upcoming' ? '募集中' : event.status === 'ongoing' ? '開催中' : '終了'}
                </span>
              </div>
              
              <h3 class="text-xl font-bold text-gray-800 mb-2">${event.title}</h3>
              ${event.theme ? `<p class="text-blue-600 font-semibold mb-2"><i class="fas fa-lightbulb mr-1"></i>${event.theme}</p>` : ''}
              <p class="text-gray-600 text-sm mb-4">${event.description.substring(0, 80)}${event.description.length > 80 ? '...' : ''}</p>
              
              <div class="space-y-2 text-sm text-gray-700 mb-4">
                <div class="flex items-center">
                  <i class="fas fa-calendar-day w-5 text-blue-600"></i>
                  <span>${new Date(event.event_date).toLocaleDateString('ja-JP')} ${event.start_time}</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-map-marker-alt w-5 text-red-600"></i>
                  <span>${event.location}</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-users w-5 text-green-600"></i>
                  <span>${event.current_participants}/${event.capacity}名</span>
                </div>
              </div>
              
              <div class="flex gap-2">
                <a href="/events/${event.id}" target="_blank" class="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                  <i class="fas fa-eye mr-1"></i>詳細
                </a>
                <button onclick="app.editEvent(${event.id})" class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">
                  <i class="fas fa-edit mr-1"></i>編集
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (error) {
      console.error('イベント一覧取得エラー:', error);
      content.innerHTML = `
        <div class="alert alert-error">
          <i class="fas fa-exclamation-circle mr-2"></i>
          イベント一覧の取得に失敗しました
        </div>
      `;
    }
  }

  editEvent(eventId) {
    // TODO: イベント編集機能（今後実装）
    alert(`イベントID ${eventId} の編集機能は今後実装予定です`);
  }

  async loadSiteSettings() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="text-center py-8"><div class="loading mx-auto"></div><p class="text-gray-600 mt-4">サイト設定を読み込み中...</p></div>';

    try {
      // テンプレートと設定の両方を取得
      const [settingsResponse, templatesResponse] = await Promise.all([
        axios.get('/api/admin/settings'),
        axios.get('/api/admin/templates')
      ]);
      
      const groupedSettings = settingsResponse.data.data;
      const templates = templatesResponse.data.data;

      const categoryNames = {
        'header': 'ヘッダー設定',
        'concept': 'コンセプト説明',
        'instructor': '講師紹介',
        'contact': 'お問い合わせ',
        'footer': 'フッター'
      };

      const categoryIcons = {
        'header': '🎯',
        'concept': '💡',
        'instructor': '👨‍🏫',
        'contact': '📧',
        'footer': '📄'
      };

      const categoryColors = {
        'header': 'from-blue-50 to-cyan-50 border-blue-500',
        'concept': 'from-purple-50 to-pink-50 border-purple-500',
        'instructor': 'from-green-50 to-emerald-50 border-green-500',
        'contact': 'from-yellow-50 to-amber-50 border-yellow-500',
        'footer': 'from-gray-50 to-slate-50 border-gray-500'
      };

      // カテゴリごとにテンプレートをグループ化
      const templatesByCategory = {};
      templates.forEach(template => {
        if (!templatesByCategory[template.category]) {
          templatesByCategory[template.category] = [];
        }
        templatesByCategory[template.category].push(template);
      });

      const categoryLabels = {
        'official': '公式',
        'tone': '文体スタイル',
        'industry': '業界特化',
        'custom': 'カスタム'
      };

      let formHTML = `
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-gray-800 flex items-center">
            <span class="text-4xl mr-3">⚙️</span>
            サイト設定編集
          </h2>
          <p class="text-gray-600 mt-2">メインページの文言や表示内容を編集できます</p>
        </div>

        <!-- テンプレート選択セクション -->
        <div class="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-indigo-500 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800 flex items-center">
              <span class="text-2xl mr-2">🎨</span>
              テンプレートから選択
            </h3>
            <button type="button" onclick="app.showSaveTemplateDialog()" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition">
              <i class="fas fa-save mr-2"></i>現在の設定を保存
            </button>
          </div>
          <p class="text-gray-600 mb-4 text-sm">プリセットテンプレートを選んで、サイトの雰囲気を一括変更できます</p>
          
          ${Object.entries(templatesByCategory).map(([category, categoryTemplates]) => `
            <div class="mb-6">
              <h4 class="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">${categoryLabels[category]}</h4>
              <div class="grid md:grid-cols-3 gap-3">
                ${categoryTemplates.map(template => `
                  <button type="button" 
                    onclick="app.applyTemplate(${template.id}, '${template.display_name}')" 
                    class="template-card bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50 border-2 border-gray-200 hover:border-indigo-400 p-4 rounded-lg text-left transition-all transform hover:scale-105 hover:shadow-lg">
                    <div class="flex items-center mb-2">
                      <span class="text-3xl mr-3">${template.icon}</span>
                      <div class="flex-1">
                        <h5 class="font-bold text-gray-800">${template.display_name}</h5>
                      </div>
                    </div>
                    <p class="text-xs text-gray-600">${template.description}</p>
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <form id="settings-form" class="space-y-8">
      `;

      // カテゴリごとにセクションを作成
      for (const [category, settings] of Object.entries(groupedSettings)) {
        formHTML += `
          <div class="bg-gradient-to-r ${categoryColors[category]} p-6 rounded-xl border-l-4">
            <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span class="text-2xl mr-2">${categoryIcons[category]}</span>
              ${categoryNames[category]}
            </h3>
            <div class="space-y-4">
        `;

        settings.forEach(setting => {
          const fieldId = setting.setting_key;
          const label = setting.display_name;
          const description = setting.description;
          const value = setting.setting_value || '';
          const type = setting.setting_type;

          formHTML += `
            <div>
              <label class="block text-gray-700 font-semibold mb-2">
                ${label}
                ${description ? `<span class="text-xs text-gray-500 font-normal ml-2">${description}</span>` : ''}
              </label>
          `;

          if (type === 'textarea') {
            formHTML += `
              <textarea 
                id="${fieldId}" 
                name="${fieldId}" 
                rows="3" 
                class="form-input w-full px-4 py-3 rounded-lg"
                placeholder="${label}"
              >${value}</textarea>
            `;
          } else if (type === 'number') {
            formHTML += `
              <input 
                type="number" 
                id="${fieldId}" 
                name="${fieldId}" 
                value="${value}" 
                class="form-input w-full px-4 py-3 rounded-lg"
                placeholder="${label}"
              />
            `;
          } else if (type === 'boolean') {
            formHTML += `
              <label class="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="${fieldId}" 
                  name="${fieldId}" 
                  ${value === '1' || value === 'true' ? 'checked' : ''}
                  class="mr-2"
                />
                <span class="text-gray-700">有効にする</span>
              </label>
            `;
          } else {
            formHTML += `
              <input 
                type="text" 
                id="${fieldId}" 
                name="${fieldId}" 
                value="${value}" 
                class="form-input w-full px-4 py-3 rounded-lg"
                placeholder="${label}"
              />
            `;
          }

          formHTML += `
            </div>
          `;
        });

        formHTML += `
            </div>
          </div>
        `;
      }

      formHTML += `
          <div class="flex gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
            <button type="submit" class="flex-1 btn-primary text-white px-8 py-4 rounded-lg font-semibold text-lg">
              <i class="fas fa-save mr-2"></i>すべての設定を保存
            </button>
            <button type="button" onclick="if(confirm('変更を破棄してリロードしますか？'))location.reload()" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-4 rounded-lg font-semibold transition">
              <i class="fas fa-undo mr-2"></i>リセット
            </button>
          </div>
        </form>
      `;

      content.innerHTML = formHTML;

      // フォーム送信処理
      document.getElementById('settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleSettingsSubmit(e.target);
      });

    } catch (error) {
      console.error('サイト設定取得エラー:', error);
      content.innerHTML = `
        <div class="alert alert-error">
          <i class="fas fa-exclamation-circle mr-2"></i>
          サイト設定の取得に失敗しました
        </div>
      `;
    }
  }

  async handleSettingsSubmit(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const content = document.getElementById('admin-content');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading mr-2"></div>保存中...';

    try {
      const formData = new FormData(form);
      const updates = {};
      
      for (const [key, value] of formData.entries()) {
        updates[key] = value;
      }

      await axios.put('/api/admin/settings', updates);

      const successMsg = document.createElement('div');
      successMsg.className = 'alert alert-success mb-6 animate-fade-in fixed top-4 right-4 z-50 shadow-2xl';
      successMsg.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        サイト設定を保存しました！変更はメインページに反映されます。
      `;
      document.body.appendChild(successMsg);
      
      setTimeout(() => successMsg.remove(), 5000);
    } catch (error) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'alert alert-error mb-6 animate-fade-in fixed top-4 right-4 z-50 shadow-2xl';
      errorMsg.innerHTML = `
        <i class="fas fa-exclamation-circle mr-2"></i>
        エラー: ${error.response?.data?.error || 'サイト設定の保存に失敗しました'}
      `;
      document.body.appendChild(errorMsg);
      
      setTimeout(() => errorMsg.remove(), 5000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>すべての設定を保存';
    }
  }

  async applyTemplate(templateId, templateName) {
    if (!confirm(`「${templateName}」テンプレートを適用しますか？\n現在の設定内容は上書きされます。`)) {
      return;
    }

    try {
      await axios.post(`/api/admin/templates/${templateId}/apply`);

      const successMsg = document.createElement('div');
      successMsg.className = 'alert alert-success mb-6 animate-fade-in fixed top-4 right-4 z-50 shadow-2xl';
      successMsg.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        「${templateName}」テンプレートを適用しました！ページをリロードして確認してください。
      `;
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.remove();
        this.loadSiteSettings(); // フォームを再読み込み
      }, 2000);
    } catch (error) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'alert alert-error mb-6 animate-fade-in fixed top-4 right-4 z-50 shadow-2xl';
      errorMsg.innerHTML = `
        <i class="fas fa-exclamation-circle mr-2"></i>
        エラー: ${error.response?.data?.error || 'テンプレートの適用に失敗しました'}
      `;
      document.body.appendChild(errorMsg);
      
      setTimeout(() => errorMsg.remove(), 5000);
    }
  }

  showSaveTemplateDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in';
    dialog.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">
          <i class="fas fa-save text-purple-600 mr-2"></i>
          カスタムテンプレートを保存
        </h3>
        <p class="text-gray-600 mb-6">現在の設定内容を新しいテンプレートとして保存します</p>
        
        <form id="save-template-form" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">テンプレート名 *</label>
            <input type="text" name="template_name" required 
              class="form-input w-full px-4 py-2 rounded-lg" 
              placeholder="my-custom-style">
            <p class="text-xs text-gray-500 mt-1">英数字とハイフンのみ（例: my-style-2025）</p>
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">表示名 *</label>
            <input type="text" name="display_name" required 
              class="form-input w-full px-4 py-2 rounded-lg" 
              placeholder="マイカスタムスタイル">
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">説明</label>
            <textarea name="description" rows="2" 
              class="form-input w-full px-4 py-2 rounded-lg" 
              placeholder="このテンプレートの説明を入力"></textarea>
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">アイコン（絵文字）</label>
            <input type="text" name="icon" maxlength="2"
              class="form-input w-full px-4 py-2 rounded-lg" 
              placeholder="💾">
          </div>
          
          <div class="flex gap-3 pt-4">
            <button type="submit" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition">
              <i class="fas fa-save mr-2"></i>保存
            </button>
            <button type="button" onclick="this.closest('.fixed').remove()" 
              class="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('#save-template-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSaveTemplate(e.target, dialog);
    });
  }

  async handleSaveTemplate(form, dialog) {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading mr-2"></div>保存中...';

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      await axios.post('/api/admin/templates/custom', data);

      const successMsg = document.createElement('div');
      successMsg.className = 'alert alert-success mb-6 animate-fade-in fixed top-4 right-4 z-50 shadow-2xl';
      successMsg.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        カスタムテンプレート「${data.display_name}」を保存しました！
      `;
      document.body.appendChild(successMsg);
      
      setTimeout(() => {
        successMsg.remove();
        dialog.remove();
        this.loadSiteSettings(); // フォームを再読み込み
      }, 2000);
    } catch (error) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'alert alert-error mb-6 animate-fade-in fixed top-4 right-4 z-50 shadow-2xl';
      errorMsg.innerHTML = `
        <i class="fas fa-exclamation-circle mr-2"></i>
        エラー: ${error.response?.data?.error || 'テンプレートの保存に失敗しました'}
      `;
      document.body.appendChild(errorMsg);
      
      setTimeout(() => errorMsg.remove(), 5000);
      
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>保存';
    }
  }

  async loadInvitationCodes() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="text-center py-8"><div class="loading mx-auto"></div><p class="text-gray-600 mt-4">招待コードを読み込み中...</p></div>';

    try {
      const response = await axios.get('/api/admin/invitation-codes');
      const codes = response.data.data;

      if (codes.length === 0) {
        content.innerHTML = `
          <div class="text-center py-12">
            <i class="fas fa-key text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-600 text-lg mb-4">招待コードがまだありません</p>
            <button onclick="app.showCodeForm()" class="btn-primary text-white px-6 py-3 rounded-lg">
              <i class="fas fa-plus mr-2"></i>新規招待コードを作成
            </button>
          </div>
        `;
        return;
      }

      content.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-bold text-gray-800 flex items-center">
            <span class="text-4xl mr-3">🔑</span>
            招待コード一覧
          </h2>
          <button onclick="app.showCodeForm()" class="btn-primary text-white px-4 py-2 rounded-lg">
            <i class="fas fa-plus mr-2"></i>新規作成
          </button>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${codes.map(code => {
            const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
            const isMaxedOut = code.used_count >= code.max_uses;
            const isActive = !isExpired && !isMaxedOut && code.is_active;
            
            return `
              <div class="bg-white rounded-lg shadow-md p-5 border-l-4 ${
                isActive ? 'border-green-500' : 'border-gray-400'
              }">
                <div class="flex items-start justify-between mb-3">
                  <code class="text-xl font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded">${code.code}</code>
                  <span class="px-2 py-1 rounded text-xs ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }">
                    ${isActive ? '✓ 有効' : '✗ 無効'}
                  </span>
                </div>
                
                <div class="space-y-2 text-sm text-gray-600 mb-3">
                  <div class="flex items-center justify-between">
                    <span><i class="fas fa-hashtag w-4 text-blue-600"></i> 使用回数</span>
                    <strong class="${isMaxedOut ? 'text-red-600' : 'text-gray-800'}">${code.used_count}/${code.max_uses}</strong>
                  </div>
                  ${code.expires_at ? `
                    <div class="flex items-center justify-between">
                      <span><i class="fas fa-clock w-4 text-orange-600"></i> 有効期限</span>
                      <strong class="${isExpired ? 'text-red-600' : 'text-gray-800'}">
                        ${new Date(code.expires_at).toLocaleDateString('ja-JP')}
                      </strong>
                    </div>
                  ` : ''}
                  ${code.notes ? `
                    <div class="mt-2 pt-2 border-t">
                      <p class="text-xs text-gray-500"><i class="fas fa-sticky-note mr-1"></i>${code.notes}</p>
                    </div>
                  ` : ''}
                </div>
                
                ${isActive ? `
                  <div class="bg-green-50 p-2 rounded text-center">
                    <p class="text-xs text-green-700">✓ この招待コードは利用可能です</p>
                  </div>
                ` : `
                  <div class="bg-gray-50 p-2 rounded text-center">
                    <p class="text-xs text-gray-600">
                      ${isExpired ? '期限切れ' : isMaxedOut ? '使用回数上限' : '無効'}
                    </p>
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `;
    } catch (error) {
      console.error('招待コード一覧取得エラー:', error);
      content.innerHTML = `
        <div class="alert alert-error">
          <i class="fas fa-exclamation-circle mr-2"></i>
          招待コード一覧の取得に失敗しました
        </div>
      `;
    }
  }

  async loadApplications() {
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="text-center py-8"><div class="loading mx-auto"></div></div>';

    try {
      const response = await axios.get('/api/admin/applications');
      const applications = response.data.data;

      if (applications.length === 0) {
        content.innerHTML = '<p class="text-gray-600 text-center py-8">申込データがありません</p>';
        return;
      }

      content.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-users text-purple-600 mr-2"></i>参加申込一覧
        </h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left">イベント</th>
                <th class="px-4 py-3 text-left">会社名</th>
                <th class="px-4 py-3 text-left">氏名</th>
                <th class="px-4 py-3 text-left">メール</th>
                <th class="px-4 py-3 text-left">ステータス</th>
                <th class="px-4 py-3 text-left">申込日時</th>
              </tr>
            </thead>
            <tbody>
              ${applications.map(app => `
                <tr class="border-t hover:bg-gray-50">
                  <td class="px-4 py-3">${app.event_title}</td>
                  <td class="px-4 py-3">${app.company_name}</td>
                  <td class="px-4 py-3">${app.applicant_name}</td>
                  <td class="px-4 py-3 text-sm">${app.email}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-sm ${
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }">
                      ${app.status}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">${new Date(app.applied_at).toLocaleString('ja-JP')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error('申込一覧取得エラー:', error);
      content.innerHTML = '<div class="alert alert-error">申込一覧の取得に失敗しました</div>';
    }
  }
}

// アプリ初期化
const app = new AIEventApp();
