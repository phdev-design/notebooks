// 訂閱功能管理
class SubscriptionManager {
  constructor() {
    this.subscribers = this.loadSubscribers();
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkForUpdates();
  }

  bindEvents() {
    // RSS 複製按鈕
    const rssBtn = document.getElementById('rss-btn');
    if (rssBtn) {
      rssBtn.addEventListener('click', () => this.copyRSSUrl());
    }

    // 電子郵件訂閱表單
    const emailForm = document.getElementById('email-subscribe-form');
    if (emailForm) {
      emailForm.addEventListener('submit', (e) => this.handleEmailSubscribe(e));
    }

    // 瀏覽器通知按鈕
    const notifyBtn = document.getElementById('notify-btn');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', () => this.requestNotificationPermission());
    }

    // 訂閱彈窗控制
    const subscribeBtn = document.getElementById('subscribe-btn');
    const subscribeModal = document.getElementById('subscribe-modal');
    const closeModal = document.getElementById('close-modal');

    if (subscribeBtn && subscribeModal) {
      subscribeBtn.addEventListener('click', () => {
        subscribeModal.style.display = 'flex';
      });
    }

    if (closeModal && subscribeModal) {
      closeModal.addEventListener('click', () => {
        subscribeModal.style.display = 'none';
      });
      
      subscribeModal.addEventListener('click', (e) => {
        if (e.target === subscribeModal) {
          subscribeModal.style.display = 'none';
        }
      });
    }
  }

  // 複製 RSS URL
  async copyRSSUrl() {
    const rssUrl = `${window.location.origin}/feed.xml`;
    try {
      await navigator.clipboard.writeText(rssUrl);
      this.showMessage('RSS 網址已複製到剪貼簿！', 'success');
    } catch (err) {
      // 降級方案
      const textArea = document.createElement('textarea');
      textArea.value = rssUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showMessage('RSS 網址已複製到剪貼簿！', 'success');
    }
  }

  // 處理電子郵件訂閱
  handleEmailSubscribe(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email-input');
    const email = emailInput.value.trim();

    if (!this.isValidEmail(email)) {
      this.showMessage('請輸入有效的電子郵件地址', 'error');
      return;
    }

    // 儲存到本地
    if (!this.subscribers.includes(email)) {
      this.subscribers.push(email);
      this.saveSubscribers();
      this.showMessage('訂閱成功！我們會在有新內容時通知您。', 'success');
      emailInput.value = '';
    } else {
      this.showMessage('此電子郵件已經訂閱過了', 'info');
    }
  }

  // 請求瀏覽器通知權限
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      this.showMessage('您的瀏覽器不支援通知功能', 'error');
      return;
    }

    if (Notification.permission === 'granted') {
      this.enableBrowserNotifications();
      this.showMessage('瀏覽器通知已啟用！', 'success');
      return;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.enableBrowserNotifications();
        this.showMessage('瀏覽器通知已啟用！', 'success');
      } else {
        this.showMessage('需要允許通知權限才能啟用此功能', 'error');
      }
    } else {
      this.showMessage('通知權限已被拒絕，請在瀏覽器設定中啟用', 'error');
    }
  }

  // 啟用瀏覽器通知
  enableBrowserNotifications() {
    const isEnabled = localStorage.getItem('browser-notifications') === 'true';
    if (!isEnabled) {
      localStorage.setItem('browser-notifications', 'true');
      localStorage.setItem('last-check', Date.now().toString());
      
      // 發送測試通知
      new Notification('PHDEV Notebooks', {
        body: '瀏覽器通知已成功啟用！',
        icon: '/img/logo.png'
      });
    }
  }

  // 檢查更新
  async checkForUpdates() {
    const isNotificationEnabled = localStorage.getItem('browser-notifications') === 'true';
    if (!isNotificationEnabled) return;

    const lastCheck = localStorage.getItem('last-check');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // 每小時檢查一次
    if (!lastCheck || (now - parseInt(lastCheck)) > oneHour) {
      try {
        const response = await fetch('/feed.xml');
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        if (items.length > 0) {
          const latestItem = items[0];
          const title = latestItem.querySelector('title').textContent;
          const pubDate = latestItem.querySelector('pubDate').textContent;
          const lastNotified = localStorage.getItem('last-notified-date');
          
          if (lastNotified !== pubDate) {
            this.showUpdateNotification(title);
            localStorage.setItem('last-notified-date', pubDate);
          }
        }
        
        localStorage.setItem('last-check', now.toString());
      } catch (error) {
        console.log('檢查更新時發生錯誤:', error);
      }
    }
  }

  // 顯示更新通知
  showUpdateNotification(title) {
    if (Notification.permission === 'granted') {
      new Notification('PHDEV Notebooks 有新內容！', {
        body: title,
        icon: '/img/logo.png',
        click_action: window.location.origin
      });
    }
  }

  // 載入訂閱者列表
  loadSubscribers() {
    const saved = localStorage.getItem('email-subscribers');
    return saved ? JSON.parse(saved) : [];
  }

  // 儲存訂閱者列表
  saveSubscribers() {
    localStorage.setItem('email-subscribers', JSON.stringify(this.subscribers));
  }

  // 驗證電子郵件格式
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // 顯示訊息
  showMessage(message, type = 'info') {
    // 移除現有訊息
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
      existingMessage.remove();
    }

    // 創建新訊息
    const toast = document.createElement('div');
    toast.className = `message-toast message-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 觸發動畫
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // 自動隱藏
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  new SubscriptionManager();
});