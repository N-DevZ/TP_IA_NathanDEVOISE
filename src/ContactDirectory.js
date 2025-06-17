import React, { useState, useEffect } from 'react';
import './ContactDirectory.css';
import { MdPhoneInTalk, MdVideocam, MdPhoneForwarded, MdFilterAlt, MdSortByAlpha, MdFormatListNumbered, MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';

function ContactDirectory({ onCallContact, onVideoCallContact, isTransferMode, handleTransferClick, t, token, title }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [filterOption, setFilterOption] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!token) {
        setError(t("tokenUnavailable"));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://192.168.1.201:3000/users', {
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
          number: user.name,
          extension: user.extension,
        }));

        setContacts(formattedContacts);
        setFilteredContacts(formattedContacts); // Par défaut, afficher tous les contacts
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

  useEffect(() => {
    // Filtrage des contacts en fonction du terme de recherche
    if (searchTerm.trim() === '') {
      // Si la barre de recherche est vide, on affiche tous les contacts
      setFilteredContacts(contacts);
    } else {
      // Sinon, on applique un filtre basé sur le terme de recherche
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.extension.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [searchTerm, contacts]);

  useEffect(() => {
    // Trie les contacts en fonction du `filterOption` et `sortOrder`
    let sortedContacts = [...filteredContacts];
    if (filterOption === 'name') {
      sortedContacts.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.number.localeCompare(b.number);
        } else {
          return b.number.localeCompare(a.number);
        }
      });
    } else if (filterOption === 'extension') {
      sortedContacts.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.extension.localeCompare(b.extension);
        } else {
          return b.extension.localeCompare(a.extension);
        }
      });
    }
    setFilteredContacts(sortedContacts);
  }, [filterOption, sortOrder, filteredContacts]);

  const highlightText = (text, highlight) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  const handleFilterClick = () => {
    setShowSortOptions(!showSortOptions);
  };

  const handleFilterChange = (option) => {
    setFilterOption(option);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Mise à jour du terme de recherche
  };

  if (error) {
    return <div className="contact-directory"><div className="error-message">{error}</div></div>;
  }

  if (isLoading) {
    return <div className="contact-directory"><div className="loading-message">{t("loadingContacts")}</div></div>;
  }

  return (
    <div className={`contact-directory ${isTransferMode ? 'transfer-mode' : ''}`}>
      <h2>{title || t("directory")}</h2>
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('Search by name or extension')}
          className="search-input"
        />
      </div>
      <div className="filter-container">
        <button onClick={handleFilterClick} className="filter-button">
          <MdFilterAlt />
        </button>

        {showSortOptions && (
          <div className="sort-options">
            <div className="sort-group-alpha">
              <div
                className={`sort-option ${filterOption === 'name' ? 'active' : ''}`}
                onClick={() => handleFilterChange('name')}
              >
                <MdFormatListNumbered />
              </div>
              <div
                className={`sort-option ${filterOption === 'extension' ? 'active' : ''}`}
                onClick={() => handleFilterChange('extension')}
              >
                <MdSortByAlpha />
              </div>
            </div>

            <div className="sort-group-order">
              <div
                className={`sort-order ${sortOrder === 'asc' ? 'active' : ''}`}
                onClick={() => handleSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="contact-list-container">
        {searchTerm && filteredContacts.length === 0 ? (
          <p>{t("noContactsFound")}</p>
        ) : (
          <ul className="contact-list">
            {filteredContacts.map((contact) => (
              <li key={contact.id} className="contact-item">
                <div className="contact-info">
                  <div className="contact-name-extension">
                    <span className="contact-name">{highlightText(contact.name, searchTerm)}</span>
                    <span className="contact-extension">{highlightText(contact.number, searchTerm)}</span>
                  </div>
                  <span className="contact-number">{highlightText(contact.extension, searchTerm)}</span>
                </div>
                <div className="contact-actions">
                  {!isTransferMode ? (
                    <>
                      <button
                        className="call-button-contacts"
                        onClick={() => onCallContact(contact)}
                      >
                        <MdPhoneInTalk className="call-icon-contacts" />
                      </button>
                      <button
                        className="video-call-button-contacts"
                        onClick={() => onVideoCallContact(contact)}
                      >
                        <MdVideocam className="video-call-icon-contacts" />
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-transfer"
                      onClick={() => handleTransferClick(contact)}
                    >
                      <MdPhoneForwarded className="transfer-icon-contacts" />
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
