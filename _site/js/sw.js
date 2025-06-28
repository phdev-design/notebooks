// Service Worker for Push Notifications
const CACHE_NAME = 'phdev-notebooks-v1';
const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/subscription.js',
  '/img/logo.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截請求，提供離線功能
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果在快取中找到，則返回快取版本
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// 處理推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'PHDEV Notebooks 有新內容！',
    icon: '/img/logo.png',
    badge: '/img/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看新內容',
        icon: '/img/logo.png'
      },
      {
        action: 'close',
        title: '關閉',
        icon: '/img/logo.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PHDEV Notebooks', options)
  );
});

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // 開啟網站
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 什麼都不做，通知已經關閉
  } else {
    // 預設行為：開啟網站
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 背景同步（檢查更新）
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
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
      
      // 檢查是否有新內容
      const lastCheck = await getLastCheckDate();
      const itemDate = new Date(pubDate);
      
      if (!lastCheck || itemDate > lastCheck) {
        // 發送推送通知
        await self.registration.showNotification('PHDEV Notebooks', {
          body: `新文章：${title}`,
          icon: '/img/logo.png',
          badge: '/img/logo.png',
          tag: 'new-post'
        });
        
        // 更新最後檢查時間
        await setLastCheckDate(itemDate);
      }
    }
  } catch (error) {
    console.log('檢查更新時發生錯誤:', error);
  }
}

// 輔助函數：取得最後檢查日期
async function getLastCheckDate() {
  return new Promise((resolve) => {
    const request = indexedDB.open('PHDEVNotifications', 1);
    
    request.onerror = () => resolve(null);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['dates'], 'readonly');
      const store = transaction.objectStore('dates');
      const getRequest = store.get('lastCheck');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result ? new Date(getRequest.result.date) : null);
      };
      
      getRequest.onerror = () => resolve(null);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('dates', { keyPath: 'id' });
    };
  });
}

// 輔助函數：設定最後檢查日期
async function setLastCheckDate(date) {
  return new Promise((resolve) => {
    const request = indexedDB.open('PHDEVNotifications', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['dates'], 'readwrite');
      const store = transaction.objectStore('dates');
      
      store.put({
        id: 'lastCheck',
        date: date.toISOString()
      });
      
      transaction.oncomplete = () => resolve();
    };
    
    request.onerror = () => resolve();
  });
}