
import React, { useState, useEffect, useCallback } from 'react';
import { MdPlayArrow, MdPause, MdDelete } from 'react-icons/md';
import './VoiceMessages.css';

function VoiceMessages({ t = (key) => key, token, username }) {
  const [messages, setMessages] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

const fetchVoicemails = useCallback(async () => {
  try {
    const response = await fetch(`http://192.168.1.95:3000/voicemails/${username}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch voicemails');
    }

    const data = await response.json();
    setMessages(data);
  } catch (error) {
    console.error('Error fetching voicemails:', error);
  }
}, [token, username]);

useEffect(() => {
  fetchVoicemails();
}, [fetchVoicemails]);
  const fetchVoiceMessages = useCallback(async () => {
    try {
      const response = await fetch(`http://192.168.1.95:3000/vocal-messages/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch voice messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching voice messages:', error);
    }
  }, [token, username]);

  useEffect(() => {
    fetchVoiceMessages();
  }, [fetchVoiceMessages]);

  const handlePlay = (id) => {
    const message = messages.find(m => m.id === id);
    if (message) {
      const audio = new Audio(`data:audio/wav;base64,${message.audio_data}`);
      audio.play();
      setCurrentlyPlaying(id);
      audio.onended = () => setCurrentlyPlaying(null);
    }
  };

  const handlePause = () => {
    // Implement pause logic if needed
    setCurrentlyPlaying(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://192.168.1.95:3000/vocal-messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete voice message');
      }
      setMessages(messages.filter(message => message.id !== id));
    } catch (error) {
      console.error('Error deleting voice message:', error);
    }
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
                <span className="from">{message.sender_name} ({message.sender_id})</span>
                <span className="date">{new Date(message.timestamp).toLocaleString()}</span>
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