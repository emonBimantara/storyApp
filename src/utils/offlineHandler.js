if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  }).then(registration => {
    console.log('ServiceWorker registration successful with scope:', registration.scope);
  }).catch(err => {
    console.log('ServiceWorker registration failed:', err);
  });
}

navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'ONLINE') {
    document.body.classList.remove('offline');
  } else if (event.data.type === 'OFFLINE') {
    document.body.classList.add('offline');
  }
}); 