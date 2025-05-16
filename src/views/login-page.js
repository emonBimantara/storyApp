import LoginPagePresenter from '../presenters/login-presenter.js';

const LoginPage = {
  async render() {
    return `
      <div class="page-container">
        <div class="auth-container">
          <h2>Login</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
            <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
          </form>
        </div>
      </div>
    `;
  },

  async afterRender() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        await LoginPagePresenter.login(email, password);
        window.location.hash = '/';
      } catch (error) {
        alert(error.message);
      }
    });
  },
};

export default LoginPage; 