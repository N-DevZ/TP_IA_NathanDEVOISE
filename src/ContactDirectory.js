import React, { useState, useEffect } from 'react';
import './ContactDirectory.css';
import callIcon from './assets/call.png';

function ContactDirectory({ onCallContact, token, t }) {
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
        const response = await fetch('http://192.168.1.29:3000/users', {
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
          name: `${user.prenom || ''} ${user.nom || ''}`.trim() || `${t("ext")} ${user.extension}`,
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
    <div className="contact-directory">
      <h2>{t("directory")}</h2>
      <div className="contact-list-container">
        {contacts.length === 0 ? (
          <p>{t("noContactsFound")}</p>
        ) : (
          <ul className="contact-list">
            {contacts.map(contact => (
              <li key={contact.id} className="contact-item">
                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-number">{contact.number}</div>
                </div>
                <button className="call-button-contacts" onClick={() => onCallContact(contact.number)}>
                                        <img src={callIcon} alt={t('voiceCall')} className="call-icon-contacts" />

                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ContactDirectory;