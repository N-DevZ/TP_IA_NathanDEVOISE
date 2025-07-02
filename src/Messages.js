import React, { useState, useEffect, useRef } from 'react';
import { MdSend } from 'react-icons/md';
import './Messages.css';

function Messages({ username, token, t }) {
  const [contacts, setContacts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [thread, setThread] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false); // État de "taper"
  const [typingTimeout, setTypingTimeout] = useState(null); // Gère le délai d'inactivité
  const messagesEndRef = useRef(null);

  const fetchContacts = async () => {
    try {
      const res = await fetch('http://192.168.1.95:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      const me = data.find((u) => u.extension === username);
      setCurrentUserId(me?.id);
      const contactsWithLastMessage = await Promise.all(
        data.map(async (contact) => {
          const lastMessage = await fetchLastMessage(contact.id, me?.id);
          return { ...contact, lastMessage };
        })
      );
      setContacts(contactsWithLastMessage);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts');
    }
  };

  const fetchLastMessage = async (contactId, myId = currentUserId) => {
    if (!myId) return '';
    try {
      const url = `http://192.168.1.95:3000/messages/last/${myId}/${contactId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch last message');
      const data = await res.json();
      return data ? data.content : '';
    } catch (error) {
      console.error(`Error fetching last message for contact ${contactId}:`, error);
      return '';
    }
  };

  const fetchThread = async (contactId) => {
    if (!currentUserId) return;
    try {
      const res = await fetch(`http://192.168.1.95:3000/messages/${currentUserId}/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch thread');
      const data = await res.json();
      setThread(data);
    } catch (error) {
      console.error('Error fetching thread:', error);
      setError('Failed to fetch messages');
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    fetchThread(contact.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    try {
      // Envoi du message
      const res = await fetch('http://192.168.1.95:3000/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sender_extension: username,
          receiver_extension: selectedContact.extension,
          content: newMessage.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setNewMessage('');
      fetchThread(selectedContact.id); // Refait la conversation après l'envoi
      fetchContacts(); // Rafraîchit les contacts
      setIsTyping(false); // Désactive "taper" après l'envoi du message
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Active l'indicateur "taper"
    setIsTyping(true);

    // Si un délai d'inactivité existe, on l'efface
    if (typingTimeout) clearTimeout(typingTimeout);

    // Redonne un délai de 2 secondes pour éteindre "taper" après la fin de la frappe
    const timeout = setTimeout(() => {
      setIsTyping(false); // L'indicateur "taper" s'éteint après 2 secondes
    }, 2000);

    setTypingTimeout(timeout);
  };

  useEffect(() => {
    fetchContacts();
  }, [username, token]);

  useEffect(() => {
    if (selectedContact) {
      fetchThread(selectedContact.id);

      const interval = setInterval(() => {
        fetchThread(selectedContact.id); // Rafraîchit la conversation
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [thread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <h2 className="messages-title">{t('Messages')}</h2>
      <div className="messages-container">
        <div className="contacts-list">
          <h2>{t('Contacts')}</h2>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
              onClick={() => handleContactClick(contact)}
            >
              <strong>{contact.name}</strong>
              <p>
                {contact.lastMessage && contact.lastMessage.length > 50
                  ? `${contact.lastMessage.substring(0, 50)}...`
                  : contact.lastMessage || t('No messages yet')}
              </p>
            </div>
          ))}
        </div>
        <div className="messages-area">
          {selectedContact ? (
            <>
              <h3>
                {t('Conversation with')} {selectedContact.name}
              </h3>
              <div className="messages-list">
                {thread.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
                  >
                    <p>{msg.content}</p>
                    <small>{new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                ))}
                {isTyping && (
                  <div className="typing-indicator">
                    <span>{t('is typing...')}</span>
                    <div className="typing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input">
                <input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder={t('Type your message...')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>
                  <MdSend />
                </button>
              </div>
            </>
          ) : (
            <p>{t('Select a contact to start a conversation')}</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Messages;
