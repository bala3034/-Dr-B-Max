// Service Worker for Dr. B-MAX Medication Alarms
// This runs in the background even when the browser tab is closed.

const CACHE_NAME = 'dr-bmax-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Store scheduled alarms in memory
let scheduledAlarms = [];

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_ALARMS') {
    scheduledAlarms = event.data.alarms || [];
    scheduleChecks();
  }
  if (event.data?.type === 'CLEAR_ALARMS') {
    scheduledAlarms = [];
  }
});

let checkInterval = null;

function scheduleChecks() {
  if (checkInterval) clearInterval(checkInterval);
  
  checkInterval = setInterval(() => {
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    scheduledAlarms.forEach(alarm => {
      if (alarm.time === currentHHMM && !alarm.fired) {
        alarm.fired = true;
        self.registration.showNotification('💊 Dr. B-MAX Medication Reminder', {
          body: `Time to take ${alarm.dosage} of ${alarm.name}!`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `alarm-${alarm.id}`,
          requireInteraction: true,
          actions: [
            { action: 'taken', title: '✅ Taken' },
            { action: 'snooze', title: '⏰ Snooze 10 min' }
          ]
        });
      }
    });
  }, 30000); // Check every 30 seconds
}

// Handle notification action clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'taken') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        const alarmId = event.notification.tag.replace('alarm-', '');
        clients.forEach(client => {
          client.postMessage({ type: 'MARK_TAKEN', id: parseInt(alarmId) });
        });
      })
    );
  } else if (event.action === 'snooze') {
    const alarm = scheduledAlarms.find(a => 
      event.notification.tag === `alarm-${a.id}`
    );
    if (alarm) {
      setTimeout(() => {
        self.registration.showNotification('💊 Dr. B-MAX Snooze Reminder', {
          body: `Don't forget! Take ${alarm.dosage} of ${alarm.name}`,
          icon: '/favicon.ico',
          tag: `alarm-${alarm.id}`,
          requireInteraction: true,
        });
      }, 10 * 60 * 1000); // 10 minutes
    }
  } else {
    // Open the app
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        if (clients.length > 0) {
          clients[0].focus();
        } else {
          self.clients.openWindow('/medications');
        }
      })
    );
  }
});
