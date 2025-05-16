import { getStories, deleteStory } from '../utils/idb.js';

const SavedPage = {
  async render() {
    return `
      <div class="page-container">
        <h2>Daftar Cerita Tersimpan (Offline)</h2>
        <div class="story-list" id="saved-story-list"></div>
      </div>
    `;
  },

  async afterRender() {
    const listContainer = document.getElementById('saved-story-list');
    const stories = await getStories();
    if (!stories || stories.length === 0) {
      listContainer.innerHTML = '<p class="no-stories">Tidak ada cerita tersimpan di perangkat.</p>';
      return;
    }
    listContainer.innerHTML = '';
    stories.forEach((story) => {
      const card = document.createElement('div');
      card.className = 'story-card';
      card.innerHTML = `
        <img src="/icons/icon-192x192.png" alt="Story" />
        <div class="card-content">
          <h3>${story.name || 'Tanpa Nama'}</h3>
          <p>${story.description || ''}</p>
          <button class="delete-btn" data-id="${story.id}">Hapus</button>
        </div>
      `;
      listContainer.appendChild(card);
    });
    listContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        await deleteStory(id);
        btn.closest('.story-card').remove();
      });
    });
  }
};

export default SavedPage; 