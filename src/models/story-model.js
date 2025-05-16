import Auth from '../utils/auth.js';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const StoryModel = {
  async getStories() {
    try {
      const token = Auth.getToken();
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      const response = await fetch(`${BASE_URL}/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data cerita');
      }

      const result = await response.json();
      return result.listStory;
    } catch (error) {
      console.error('Error in getStories:', error);
      throw error;
    }
  },

  async getDetailStory(id) {
    try {
      const token = Auth.getToken();
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      const response = await fetch(`${BASE_URL}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil detail cerita');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in getDetailStory:', error);
      throw error;
    }
  },

  async postStory({ description, photo, lat, lon }) {
    try {
      const token = Auth.getToken();
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      const formData = new FormData();
      formData.append('description', description);

      const res = await fetch(photo);
      const blob = await res.blob();
      formData.append('photo', blob, 'photo.jpg');

      if (lat && lon) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      const response = await fetch(`${BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan cerita');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error in postStory:', error);
      throw error;
    }
  },
};

export default StoryModel; 