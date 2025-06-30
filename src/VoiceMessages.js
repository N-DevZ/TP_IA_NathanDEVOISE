import React, { useState, useEffect } from 'react';
import { MdPlayArrow, MdPause, MdDelete } from 'react-icons/md';
import './VoiceMessages.css';

function VoiceMessages({ t = (key) => key }) {  // Ajout d'une valeur par défaut pour t
  const [messages, setMessages] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    // Ici, vous devriez charger les messages vocaux depuis votre API
    // Pour l'exemple, nous utiliserons des données factices
    const fakeMessages = [
      { id: 1, from: 'John Doe', date: '2023-05-20 10:30', duration: '0:30' },
      { id: 2, from: 'Jane Smith', date: '2023-05-19 15:45', duration: '1:15' },
      { id: 3, from: 'Bob Johnson', date: '2023-05-18 09:00', duration: '0:45' },
    ];
    setMessages(fakeMessages);
  }, []);

  const handlePlay = (id) => {
    // Ici, vous devriez implémenter la logique pour jouer le message
    setCurrentlyPlaying(id);
  };

  const handlePause = () => {
    // Ici, vous devriez implémenter la logique pour mettre en pause le message
    setCurrentlyPlaying(null);
  };

  const handleDelete = (id) => {
    // Ici, vous devriez implémenter la logique pour supprimer le message
    setMessages(messages.filter(message => message.id !== id));
  };

  return (
    <div className="voice-messages">
      <h2>{t('Voice Messages')}</h2>
      {messages.length === 0 ? (
        <p>{t('No voice messages')}</p>
      ) : (
        <ul>
          {messages.map((message) => (
            <li key={message.id} className="voice-message-item">
              <div className="message-info">
                <span className="from">{message.from}</span>
                <span className="date">{message.date}</span>
                <span className="duration">{message.duration}</span>
              </div>
              <div className="message-controls">
                {currentlyPlaying === message.id ? (
                  <button onClick={handlePause}><MdPause /></button>
                ) : (
                  <button onClick={() => handlePlay(message.id)}><MdPlayArrow /></button>
                )}
                <button onClick={() => handleDelete(message.id)}><MdDelete /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VoiceMessages;