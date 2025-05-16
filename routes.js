import HomePage from './src/views/home-page.js';
import AddPage from './src/views/add-page.js';
import LoginPage from './src/views/login-page.js';
import RegisterPage from './src/views/register-page.js';
import Auth from './src/utils/auth.js';
import SavedPage from './src/views/saved-page.js';

const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add': {
    render: AddPage.render,
    afterRender: AddPage.afterRender,
    checkAuth: true,
  },
  '/saved': SavedPage,
};

export default routes;