
import React, { useState, useEffect } from 'react';
import './ContactDirectory.css';
import callIcon from './assets/call.png';
import videocallicon from './assets/videocall.png';

function ContactDirectory({ onCallContact, onVideoCallContact, isTransferMode, onTransfer, t, token }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) {
        setError(t("tokenUnavailable"));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://192.168.1.34:3000/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`${t("httpError")}: ${response.status}`);
        }

        const data = await response.json();

        const formattedContacts = data.map((user, index) => ({
          id: user.id || index + 1,
          name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
          number: user.extension,
        }));

        setContacts(formattedContacts);
        setError(null);
      } catch (error) {
        console.error(t("contactsFetchError"), error);
        setError(t("contactsLoadError"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [token, t]);

  if (error) {
    return <div className="contact-directory"><div className="error-message">{error}</div></div>;
  }

  if (isLoading) {
    return <div className="contact-directory"><div className="loading-message">{t("loadingContacts")}</div></div>;
  }

  return (
    <div className={`contact-directory ${isTransferMode ? 'transfer-mode' : ''}`}>
      <h2>{t("directory")}</h2>
      <div className="contact-list-container">
        {contacts.length === 0 ? (
          <p>{t("noContactsFound")}</p>
        ) : (
          <ul className="contact-list">
            {contacts.map((contact) => (
              <li key={contact.id} className="contact-item">
                <div className="contact-info">
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-number">{contact.number}</span>
                </div>
                <div className="contact-actions">
                  {!isTransferMode ? (
                    <>
                      <img 
                        src={callIcon} 
                        alt={t('voiceCall')} 
                        className="call-icon-contacts" 
                        onClick={() => onCallContact(contact.number)}
                        title={t('voiceCall')}
                        style={{ cursor: 'pointer' }}
                      />
                      <img 
                        src={videocallicon} 
                        alt={t('videoCall')} 
                        className="video-call-icon-contacts" 
                        onClick={() => onVideoCallContact(contact.number)}
                        title={t('videoCall')}
                        style={{ cursor: 'pointer' }}
                      />
                    </>
                  ) : (
                    <button
                      className="transfer-contact-button"
                      onClick={() => onTransfer(contact.number)}
                    >
                      {t('transfer')}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ContactDirectory;