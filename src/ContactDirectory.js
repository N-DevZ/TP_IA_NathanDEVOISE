import React, { useState, useEffect } from 'react';
import './ContactDirectory.css';

function ContactDirectory({ onCallContact, token }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) {
        setError("Token non disponible. Veuillez vous reconnecter.");
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
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        const formattedContacts = data.map((user, index) => ({
          id: user.id || index + 1,
          name: `${user.prenom || ''} ${user.nom || ''}`.trim() || `Ext ${user.extension}`,
          number: user.extension,
        }));

        setContacts(formattedContacts);
        setError(null);
      } catch (error) {
        console.error('Erreur récupération contacts:', error);
        setError("Impossible de charger les contacts. Veuillez réessayer plus tard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [token]);

  if (error) {
    return <div className="contact-directory"><div className="error-message">{error}</div></div>;
  }

  if (isLoading) {
    return <div className="contact-directory"><div className="loading-message">Chargement des contacts...</div></div>;
  }

  return (
    <div className="contact-directory">
      <h2>Répertoire</h2>
      <div className="contact-list-container">
        {contacts.length === 0 ? (
          <p>Aucun contact trouvé.</p>
        ) : (
          <ul className="contact-list">
            {contacts.map(contact => (
              <li key={contact.id} className="contact-item">
                <div className="contact-info">
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-number">{contact.number}</div>
                </div>
                <button className="call-button" onClick={() => onCallContact(contact.number)}>
                  Appeler
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