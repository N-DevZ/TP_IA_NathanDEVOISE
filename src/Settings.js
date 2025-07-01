import React, { useState, useEffect, useRef  } from 'react';
import './Settings.css';

function Settings({ onClose, onThemeChange, onLanguageChange, theme, language, username, token }) {
  const [localTheme, setLocalTheme] = useState(theme);
  const [localLanguage, setLocalLanguage] = useState(language);
    const [voicemailPreference, setVoicemailPreference] = useState(false);
  const [customVoicemail, setCustomVoicemail] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const handleSave = () => {
    onThemeChange(localTheme);
    onLanguageChange(localLanguage);
    onClose();
  };
   useEffect(() => {
    // Charger les préférences de messagerie vocale
    const fetchVoicemailPreferences = async () => {
      try {
        const response = await fetch(`http://192.168.1.95:3000/users/${username}/voicemail-preference`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setVoicemailPreference(data.useCustomVoicemail);
        setCustomVoicemail(data.customVoicemailUrl);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences de messagerie vocale:', error);
      }
    };

    fetchVoicemailPreferences();
  }, [token, username]);

  const handleVoicemailPreferenceChange = async (event) => {
    const useCustom = event.target.checked;
    setVoicemailPreference(useCustom);
    try {
      await fetch(`http://192.168.1.95:3000/users/${username}/voicemail-preference`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ useCustomVoicemail: useCustom })
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de messagerie vocale:', error);
    }
  };

  const uploadVoicemail = async (audioBlob) => {
    const formData = new FormData();
    formData.append('voicemail', audioBlob);

    try {
      const response = await fetch(`http://192.168.1.95:3000/users/${username}/custom-voicemail`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (response.ok) {
        console.log('Messagerie vocale personnalisée téléchargée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement de la messagerie vocale:', error);
    }
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