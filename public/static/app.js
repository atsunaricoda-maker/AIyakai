// AI夜会・AI茶会 フロントエンドアプリケーション

class AIEventApp {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.allEvents = []; // 全イベントを保持
    this.currentArea = 'all'; // 現在選択中のエリア
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



  init() {
    console.log('Current page:', this.currentPage);
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
              AI夜会<span class="mx-4 text-yellow-300">・</span>AI茶会
            </h1>
            <p class="text-2xl md:text-3xl mb-6 font-semibold drop-shadow">
              みんなでAIを語り合う交流の場
            </p>
            <div class="flex flex-wrap justify-center gap-4 text-lg">
              <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                <i class="fas fa-map-marker-alt mr-2"></i>静岡県内各地で開催
              </span>
              <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                <i class="fas fa-users mr-2"></i>経営者・起業家・講師・学生歓迎
              </span>
              <span class="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                <i class="fas fa-key mr-2"></i>招待制・紹介制
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
                    AI夜会
                    <span class="text-sm bg-indigo-500 text-white px-3 py-1 rounded-full">Night</span>
                  </h3>
                  <p class="text-gray-700 leading-relaxed">お酒を片手に、リラックスした雰囲気でAI活用について語り合います。実践事例の共有やプチコンサルティングも。</p>
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
                    AI茶会
                    <span class="text-sm bg-orange-500 text-white px-3 py-1 rounded-full">Tea</span>
                  </h3>
                  <p class="text-gray-700 leading-relaxed">落ち着いた雰囲気でお茶を楽しみながら、じっくりとAIについて深く語り合います。和やかな対話の時間。</p>
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
            <span class="text-4xl mr-3">👨‍🏫</span>AI講師について
          </h2>
          <div class="bg-white p-10 rounded-2xl shadow-2xl border-t-4 border-purple-500">
            <div class="flex items-start gap-6 mb-6">
              <div class="text-6xl">✨</div>
              <div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">実践的なAI活用をサポート</h3>
                <p class="text-gray-700 leading-relaxed text-lg mb-4">
                  私たちは企業向けAIコンサルティングや講座を提供している専門家チームです。
                  実践的なAI活用支援を通じて、多くの企業の業務改善やDX推進をサポートしています。
                </p>
                <p class="text-gray-700 leading-relaxed text-lg">
                  AI夜会・AI茶会では、参加者の皆様とフランクに対話しながら、
                  それぞれの企業に合ったAI活用方法をご提案します。
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
            イベントに関するご質問や、企業コンサル・講座のご相談は<br>
            お気軽にお問い合わせください。
          </p>
          <a href="mailto:info@ai-event.local" class="inline-block btn-primary text-white px-8 py-3 rounded-lg font-semibold">
            <i class="fas fa-paper-plane mr-2"></i>お問い合わせ
          </a>
        </div>
      </section>

      <!-- フッター -->
      <footer class="bg-gray-800 text-white py-8">
        <div class="max-w-6xl mx-auto px-4 text-center">
          <p class="text-gray-400">&copy; 2025 AI夜会・AI茶会. All rights reserved.</p>
          <p class="text-gray-500 text-sm mt-2">静岡県内でAI活用の輪を広げます</p>
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
          <div class="grid md:grid-cols-4 gap-6 mb-12">
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
