import HomePagePresenter from '../presenters/home-presenter.js';
import './story-item.js';
import Auth from '../utils/auth.js';
import { saveStories, getStories } from '../utils/idb.js';

const HomePage = {
  async render() {
    return `
      <div class="page-container">
        <h2>Daftar Cerita</h2>
        <div class="story-list" id="story-list"></div>
        <div id="map" style="width: 100%; height: 400px;"></div>
      </div>
    `;
  },

  async afterRender() {
    try {
      if (!Auth.isAuthenticated()) {
        throw new Error('Anda harus login terlebih dahulu');
      }

      let stories;
      let fromIDB = false;
      try {
        stories = await HomePagePresenter.loadStories();
        await saveStories(stories);
      } catch (err) {
        stories = await getStories();
        fromIDB = true;
      }

      const listContainer = document.getElementById('story-list');
      const mapContainer = document.getElementById('map');
      
      if (!stories || stories.length === 0) {
        listContainer.innerHTML = '<p class="no-stories">Belum ada cerita yang ditambahkan</p>';
        return;
      }

      listContainer.innerHTML = '';

      this._initMap(mapContainer);

      requestAnimationFrame(() => {
        this.map.invalidateSize();
      });

      stories.forEach((story) => {
        const storyItem = document.createElement('story-item');
        storyItem.story = story;
        listContainer.appendChild(storyItem);
        this._addMarkerToMap(story);
      });

      if (fromIDB) {
        const info = document.createElement('div');
        info.className = 'offline-message';
        info.innerHTML = '<p>Menampilkan data dari penyimpanan offline (IndexedDB).</p>';
        listContainer.prepend(info);
      }
    } catch (error) {
      console.error('Error in HomePage afterRender:', error);
      const listContainer = document.getElementById('story-list');
      
      if (error.message === 'Anda harus login terlebih dahulu') {
        listContainer.innerHTML = `
          <div class="error-message">
            <p>${error.message}</p>
            <a href="#/login" class="btn">Login</a>
          </div>
        `;
      } else if (!navigator.onLine) {
        listContainer.innerHTML = `
          <div class="error-message">
            <p>Kamu sedang offline. Cerita tidak dapat dimuat.</p>
          </div>
          <div class="story-list">
            <div class="story-card">
              <img src="/icons/icon-192x192.png" alt="Offline Dummy Story" />
              <div class="card-content">
                <h3>Contoh Cerita Offline</h3>
                <p>Anda sedang offline. Cerita asli akan muncul di sini saat Anda online kembali.</p>
              </div>
            </div>
          </div>
        `;
      } else {
        listContainer.innerHTML = `
          <div class="error-message">
            <p>Gagal memuat cerita. Silakan coba lagi nanti.</p>
            <button onclick="window.location.reload()" class="btn">Muat Ulang</button>
          </div>
        `;
      }
    }
  },

  _initMap(mapContainer) {
    if (this.map) {
      this.map.remove(); 
      this.map = null;
    }

    this.map = L.map(mapContainer).setView([-6.200000, 106.816666], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  },

  _addMarkerToMap(story) {
    const { lat, lon } = story;
  
    if (lat && lon) {
      const markerIcon = L.divIcon({
        className: 'emoji-marker',
        html: '📍',
        iconSize: [30, 30],
      });

      const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(this.map);

      marker.bindPopup(
        `<strong>${story.name}</strong><br>
         ${story.description}<br>
         Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}<br>
         Lokasi: Lat: ${lat}, Lon: ${lon}<br>`
      );
    }
  }
};

export default HomePage;