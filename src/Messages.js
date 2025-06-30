import React, { useState, useEffect, useRef } from 'react';
import { MdSend } from 'react-icons/md';
import './Messages.css';

function Messages({ username, token, t }) {
  const [contacts, setContacts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); // 👈 Ajout
  const [selectedContact, setSelectedContact] = useState(null);
  const [thread, setThread] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  console.log('Component rendered. Username:', username, 'Token:', token);

  useEffect(() => {
    console.log('Fetching contacts...');
    fetchContacts();
  }, [username, token]);

  useEffect(() => {
    if (selectedContact) {
      console.log('Selected contact changed:', selectedContact);
      fetchThread(selectedContact.id);
    }
  }, [selectedContact]);

  useEffect(() => {
    console.log('Thread updated:', thread);
    scrollToBottom();
  }, [thread]);

  const scrollToBottom = () => {
    console.log('Scrolling to bottom');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    try {
      const res = await fetch('http://192.168.1.95:3000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      const data = await res.json();
      console.log('Contacts fetched:', data);

      const me = data.find((u) => u.extension === username);
      setCurrentUserId(me?.id); // 👈 Mémorise l’ID de l’utilisateur actuel

      console.log('Fetching last messages for contacts...');
      const contactsWithLastMessage = await Promise.all(
        data.map(async (contact) => {
          const lastMessage = await fetchLastMessage(contact.id, me?.id);
          return { ...contact, lastMessage };
        })
      );

      console.log('Contacts with last messages:', contactsWithLastMessage);
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
      console.log(`Fetching from URL: ${url}`);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`Response status: ${res.status}`);
      if (!res.ok) throw new Error('Failed to fetch last message');
      const data = await res.json();
      console.log(`Last message data for contact ${contactId}:`, data);
      return data ? data.content : '';
    } catch (error) {
      console.error(`Error fetching last message for contact ${contactId}:`, error);
      return '';
    }
  };

  const fetchThread = async (contactId) => {
    if (!currentUserId) return;
    console.log('Fetching thread for contact:', contactId);
    try {
      const res = await fetch(`http://192.168.1.95:3000/messages/${currentUserId}/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Thread fetch response:', res);
      if (!res.ok) throw new Error('Failed to fetch thread');
      const data = await res.json();
      console.log('Thread data:', data);
      setThread(data);
    } catch (error) {
      console.error('Error fetching thread:', error);
      setError('Failed to fetch messages');
    }
  };

  const handleContactClick = (contact) => {
    console.log('Contact clicked:', contact);
    setSelectedContact(contact);
    fetchThread(contact.id);
  };

  const handleSendMessage = async () => {
    console.log('Sending message:', newMessage);
    if (!newMessage.trim() || !selectedContact) return;

    try {
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

      console.log('Message sent successfully');
      setNewMessage('');
      fetchThread(selectedContact.id);
      fetchContacts(); // Refresh contacts to update last messages
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message');
    }
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
            <strong>
              {contact.name}
            </strong>
            <p>{contact.lastMessage || t('No messages yet')}</p>
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
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('Type your message...')}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>
                <MdSend />
              </button>
            </div>
          </>
        ) : (
          <p>{t('Select a contact to start messaging')}</p>
        )}
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  </>
);
}

export default Messages;
