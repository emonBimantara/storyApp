import './styles/main.css';
import './styles/transitions.css';
import routes from './routes.js';
import 'leaflet/dist/leaflet.css';
import Auth from './src/utils/auth.js';
import { initializePushNotification } from './src/utils/pushNotification.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
        if (!navigator.onLine) {
          document.body.classList.add('offline');
          showNotification('Anda sedang offline. Beberapa fitur mungkin tidak tersedia.');
        }
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  showNotification('Anda kembali online!');
  if (window.location.hash !== '#/login' && window.location.hash !== '#/register') {
    renderPage();
  }
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
  showNotification('Anda sedang offline. Beberapa fitur mungkin tidak tersedia.');
});

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

const main = document.getElementById('main-content');
const skipLink = document.querySelector('.skip-to-content');
const mainContent = document.getElementById('main-content');

skipLink.addEventListener('click', function (event) {
    event.preventDefault();
    skipLink.blur();
    mainContent.focus();
    mainContent.scrollIntoView({ behavior: 'smooth' });
});

function parseActiveUrl() {
  const url = window.location.hash.slice(1).toLowerCase() || '/';
  const urlParts = url.split('/');
  return urlParts.length > 2
    ? `/${urlParts[1]}/:id`
    : `/${urlParts[1] || ''}`;
}

function renderNavigation() {
  const nav = document.querySelector('nav');
  const user = Auth.getUser();
  
  nav.innerHTML = `
    <div class="nav-wrapper">
      <a href="#/" class="brand-logo">Story App</a>
      <ul class="right">
        ${user ? `
          <li><a href="#/add">Tambah Cerita</a></li>
          <li><a href="#/saved">Cerita Tersimpan</a></li>
          <li><a href="#" id="logout">Logout</a></li>
        ` : `
          <li><a href="#/login">Login</a></li>
          <li><a href="#/register">Register</a></li>
        `}
      </ul>
    </div>
  `;

  const logoutButton = document.getElementById('logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
      window.location.hash = '/login';
    });
  }

  if (user) {
    initializePushNotification();
  }
}

async function renderPage() {
  const activeRoute = parseActiveUrl();
  const page = routes[activeRoute];

  if (page) {
    if (page.checkAuth && !Auth.isAuthenticated()) {
      window.location.hash = '/login';
      return;
    }

    try {
      if (document.startViewTransition) {
        const transition = document.startViewTransition(async () => {
          main.innerHTML = await page.render();
          if (page.afterRender) await page.afterRender();
        });

        transition.ready.then(() => {
          console.log('View transition is ready');
        });

        transition.finished.then(() => {
          console.log('View transition is finished');
        });
      } else {
        main.innerHTML = await page.render();
        if (page.afterRender) await page.afterRender();
      }
    } catch (error) {
      console.error('Error during page transition:', error);
      if (!navigator.onLine) {
        main.innerHTML = `
          <div class="offline-message">
            <h2>Anda sedang offline</h2>
            <p>Beberapa fitur mungkin tidak tersedia. Silakan periksa koneksi internet Anda.</p>
            <p>Konten yang sudah di-cache masih dapat diakses.</p>
            <button onclick="window.location.reload()" class="retry-button">
              Coba Muat Ulang
            </button>
          </div>
        `;
      } else {
        main.innerHTML = `
          <div class="error-message">
            <h2>Terjadi kesalahan saat memuat halaman</h2>
            <p>Silakan coba muat ulang halaman atau kembali ke halaman sebelumnya.</p>
            <button onclick="window.location.reload()" class="retry-button">
              Coba Muat Ulang
            </button>
          </div>
        `;
      }
    }
  } else {
    main.innerHTML = `
      <div class="error-message">
        <h2>404 Halaman Tidak Ditemukan</h2>
        <p>Halaman yang Anda cari tidak ditemukan.</p>
        <a href="#/" class="back-button">Kembali ke Beranda</a>
      </div>
    `;
  }

  renderNavigation();
}

window.addEventListener('load', () => {
  renderPage();
  if (!navigator.onLine) {
    document.body.classList.add('offline');
    showNotification('Anda sedang offline. Beberapa fitur mungkin tidak tersedia.');
  }
});

window.addEventListener('hashchange', renderPage);