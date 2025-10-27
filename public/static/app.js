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

  // エリアでフィルタリング
  filterByArea(area) {
    this.currentArea = area;
    
    // タブのアクティブ状態を更新
    document.querySelectorAll('.area-tab').forEach(tab => {
      tab.classList.remove('bg-blue-600', 'text-white');
      tab.classList.add('bg-white', 'text-gray-700');
    });
    document.getElementById(`tab-${area}`).classList.remove('bg-white', 'text-gray-700');
    document.getElementById(`tab-${area}`).classList.add('bg-blue-600', 'text-white');

    // イベントをフィルタリングして表示
    this.displayFilteredEvents();
  }

  // フィルタリングされたイベントを表示
  displayFilteredEvents() {
    const eventsList = document.getElementById('events-list');
    
    let filteredEvents = this.allEvents;
    if (this.currentArea !== 'all') {
      filteredEvents = this.allEvents.filter(event => 
        this.getAreaFromLocation(event.location) === this.currentArea
      );
    }

    if (filteredEvents.length === 0) {
      eventsList.innerHTML = `
        <div class="text-center py-12 bg-white rounded-lg">
          <i class="fas fa-calendar-times text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-600 text-lg">${this.currentArea}エリアで募集中のイベントはありません</p>
          <p class="text-gray-500 text-sm mt-2">他のエリアも確認してみてください</p>
        </div>
      `;
      return;
    }

    eventsList.innerHTML = filteredEvents.map(event => this.createEventCard(event)).join('');
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
      <header class="header-gradient text-white py-16">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              <i class="fas fa-moon mr-3"></i>AI夜会<span class="mx-4">・</span>AI茶会<i class="fas fa-mug-hot ml-3"></i>
            </h1>
            <p class="text-xl md:text-2xl mb-6 opacity-90">経営者のためのAI活用交流イベント</p>
            <p class="text-lg opacity-80">静岡県内各地で開催 | 招待制・紹介制</p>
          </div>
        </div>
      </header>

      <!-- コンセプト -->
      <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 section-title">
            <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>AI夜会・AI茶会とは
          </h2>
          <div class="grid md:grid-cols-2 gap-8">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg">
              <div class="flex items-start mb-4">
                <i class="fas fa-moon text-3xl text-blue-900 mr-4 mt-1"></i>
                <div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-2">AI夜会</h3>
                  <p class="text-gray-600">お酒を片手に、リラックスした雰囲気でAI活用について語り合います。実践事例の共有やプチコンサルティングも。</p>
                </div>
              </div>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg">
              <div class="flex items-start mb-4">
                <i class="fas fa-mug-hot text-3xl text-amber-800 mr-4 mt-1"></i>
                <div>
                  <h3 class="text-2xl font-bold text-gray-800 mb-2">AI茶会</h3>
                  <p class="text-gray-600">落ち着いた雰囲気でお茶を楽しみながら、じっくりとAIについて深く語り合います。和やかな対話の時間。</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-12 bg-blue-50 p-8 rounded-lg border-l-4 border-blue-600">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
              <i class="fas fa-check-circle text-blue-600 mr-2"></i>このような方におすすめ
            </h3>
            <ul class="space-y-2 text-gray-700">
              <li><i class="fas fa-chevron-right text-blue-600 mr-2"></i>企業でAIを活用したい経営者・管理職の方</li>
              <li><i class="fas fa-chevron-right text-blue-600 mr-2"></i>他社のAI活用事例を知りたい方</li>
              <li><i class="fas fa-chevron-right text-blue-600 mr-2"></i>AI講師に直接相談したい方</li>
              <li><i class="fas fa-chevron-right text-blue-600 mr-2"></i>経営者同士のネットワークを広げたい方</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- イベント一覧 -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 section-title">
            <i class="fas fa-calendar-alt text-blue-600 mr-2"></i>開催予定のイベント
          </h2>
          
          <!-- エリアタブ -->
          <div class="mb-8">
            <div class="flex flex-wrap gap-2 justify-center">
              <button onclick="app.filterByArea('all')" id="tab-all" 
                class="area-tab px-6 py-3 rounded-lg font-semibold transition-all bg-blue-600 text-white">
                <i class="fas fa-map-marked-alt mr-2"></i>すべて
              </button>
              <button onclick="app.filterByArea('東部')" id="tab-東部" 
                class="area-tab px-6 py-3 rounded-lg font-semibold transition-all bg-white text-gray-700 hover:bg-gray-100">
                <i class="fas fa-map-marker-alt mr-2"></i>東部（沼津・三島・熱海など）
              </button>
              <button onclick="app.filterByArea('中部')" id="tab-中部" 
                class="area-tab px-6 py-3 rounded-lg font-semibold transition-all bg-white text-gray-700 hover:bg-gray-100">
                <i class="fas fa-map-marker-alt mr-2"></i>中部（静岡・焼津など）
              </button>
              <button onclick="app.filterByArea('西部')" id="tab-西部" 
                class="area-tab px-6 py-3 rounded-lg font-semibold transition-all bg-white text-gray-700 hover:bg-gray-100">
                <i class="fas fa-map-marker-alt mr-2"></i>西部（浜松・磐田など）
              </button>
            </div>
          </div>

          <div id="events-list" class="space-y-6">
            <div class="text-center py-12">
              <div class="loading mx-auto mb-4"></div>
              <p class="text-gray-600">イベント情報を読み込み中...</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 講師紹介 -->
      <section class="py-16 bg-white">
        <div class="max-w-6xl mx-auto px-4">
          <h2 class="text-3xl font-bold text-gray-800 mb-8 section-title">
            <i class="fas fa-users text-blue-600 mr-2"></i>AI講師について
          </h2>
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg">
            <p class="text-gray-700 leading-relaxed mb-4">
              私たちは企業向けAIコンサルティングや講座を提供している専門家チームです。
              実践的なAI活用支援を通じて、多くの企業の業務改善やDX推進をサポートしています。
            </p>
            <p class="text-gray-700 leading-relaxed">
              AI夜会・AI茶会では、参加者の皆様とフランクに対話しながら、
              それぞれの企業に合ったAI活用方法をご提案します。
            </p>
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

      // 初期表示（すべてのエリア）
      this.displayFilteredEvents();
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
          
          <h3 class="text-2xl font-bold text-gray-800 mb-3">${event.title}</h3>
          <p class="text-gray-600 mb-4 leading-relaxed">${event.description}</p>
          
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

              <p class="text-gray-700 text-lg leading-relaxed mb-8">${event.description}</p>

              <div class="space-y-4 bg-gray-50 p-6 rounded-lg">
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

              <!-- 会社名 -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  会社名 <span class="text-red-600">*</span>
                </label>
                <input type="text" id="company_name" name="company_name" required
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="株式会社〇〇">
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

              <!-- 役職 -->
              <div class="mb-6">
                <label class="block text-gray-700 font-semibold mb-2">
                  役職
                </label>
                <input type="text" id="position" name="position"
                  class="form-input w-full px-4 py-3 rounded-lg"
                  placeholder="代表取締役、取締役など">
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
          <div class="grid md:grid-cols-3 gap-6 mb-12">
            <div class="bg-white rounded-lg shadow-md p-6 text-center">
              <i class="fas fa-calendar-alt text-4xl text-blue-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">イベント管理</h3>
              <p class="text-gray-600 mb-4">イベントの作成・編集</p>
              <button onclick="app.showEventForm()" class="btn-primary text-white px-4 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>新規作成
              </button>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6 text-center">
              <i class="fas fa-key text-4xl text-green-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">招待コード管理</h3>
              <p class="text-gray-600 mb-4">コード生成・管理</p>
              <button onclick="app.showCodeForm()" class="btn-primary text-white px-4 py-2 rounded-lg">
                <i class="fas fa-plus mr-2"></i>新規作成
              </button>
            </div>
            <div class="bg-white rounded-lg shadow-md p-6 text-center">
              <i class="fas fa-users text-4xl text-purple-600 mb-3"></i>
              <h3 class="text-xl font-bold text-gray-800 mb-2">申込管理</h3>
              <p class="text-gray-600 mb-4">参加申込の確認</p>
              <button onclick="app.loadApplications()" class="btn-primary text-white px-4 py-2 rounded-lg">
                <i class="fas fa-list mr-2"></i>一覧表示
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
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        <i class="fas fa-calendar-plus text-blue-600 mr-2"></i>新規イベント作成
      </h2>
      <form id="event-form" class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">イベント名</label>
            <input type="text" name="title" required class="form-input w-full px-4 py-2 rounded-lg">
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">イベントタイプ</label>
            <select name="event_type" required class="form-input w-full px-4 py-2 rounded-lg">
              <option value="night">AI夜会</option>
              <option value="tea">AI茶会</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-gray-700 font-semibold mb-2">説明</label>
          <textarea name="description" required rows="4" class="form-input w-full px-4 py-2 rounded-lg"></textarea>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">開催地</label>
            <input type="text" name="location" required class="form-input w-full px-4 py-2 rounded-lg" placeholder="浜松市">
          </div>
          <div>
            <label class="block text-gray-700 font-semibold mb-2">住所</label>
            <input type="text" name="address" class="form-input w-full px-4 py-2 rounded-lg">
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
        </div>
        <div>
          <label class="block text-gray-700 font-semibold mb-2">定員</label>
          <input type="number" name="capacity" value="20" required class="form-input w-full px-4 py-2 rounded-lg">
        </div>
        <button type="submit" class="btn-primary text-white px-8 py-3 rounded-lg font-semibold">
          <i class="fas fa-save mr-2"></i>イベントを作成
        </button>
      </form>
    `;

    document.getElementById('event-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      try {
        await axios.post('/api/admin/events', data);
        alert('イベントを作成しました！');
        e.target.reset();
      } catch (error) {
        alert('エラー: ' + (error.response?.data?.error || 'イベント作成に失敗しました'));
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
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());
      
      try {
        await axios.post('/api/admin/invitation-codes', data);
        alert('招待コードを作成しました！');
        e.target.reset();
      } catch (error) {
        alert('エラー: ' + (error.response?.data?.error || '招待コード作成に失敗しました'));
      }
    });
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
