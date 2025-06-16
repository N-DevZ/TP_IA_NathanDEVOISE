
import React, { useState } from 'react';
import './LoginPage.css';
import './CustomTitleBar.css';
import CustomTitleBar from './CustomTitleBar.js';

function LoginPage({ onLogin, t }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };
// TODO language de droite à gauche à définir dans l'input de cette page.
  return (
    <div className="login-page">
      <CustomTitleBar />
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{t("welcomeToMiloSIP")}</h2>
          <input
            type="text"
            placeholder={t("username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{t("login")}</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;