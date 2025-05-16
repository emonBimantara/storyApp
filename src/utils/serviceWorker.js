// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('ServiceWorker registration successful with scope:', registration.scope);
      
      if (!navigator.onLine) {
        document.body.classList.add('offline');
      }
    })
    .catch(err => {
      console.log('ServiceWorker registration failed:', err);
    });

  window.addEventListener('online', () => {
    document.body.classList.remove('offline');
  });

  window.addEventListener('offline', () => {
    document.body.classList.add('offline');
  });
} 