import StoryModel from '../models/story-model.js';

const HomePagePresenter = {
  async loadStories() {
    try {
      const stories = await StoryModel.getStories();
      return stories;
    } catch (error) {
      console.error('Error loading stories:', error);
      throw error;
    }
  }
};

export default HomePagePresenter; 