import React, { useState } from 'react';
import './Settings.css';

function Settings({ onClose, onThemeChange, onLanguageChange, theme, language }) {
  const [localTheme, setLocalTheme] = useState(theme);
  const [localLanguage, setLocalLanguage] = useState(language);

  const handleSave = () => {
    onThemeChange(localTheme);
    onLanguageChange(localLanguage);
    onClose();
  };

  return (
    <div className="settings-modal">
      <h2>Settings</h2>
      <div>
        <label>
          Theme:
          <select value={localTheme} onChange={(e) => setLocalTheme(e.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Language:
          <select value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </label>
      </div>
      <div>
        <h3>Test Audio and Video</h3>
        <button onClick={() => {/* Ajoutez ici la logique pour tester l'audio */}}>
          Test Microphone
        </button>
        <button onClick={() => {/* Ajoutez ici la logique pour tester la vidéo */}}>
          Test Camera
        </button>
      </div>
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default Settings;