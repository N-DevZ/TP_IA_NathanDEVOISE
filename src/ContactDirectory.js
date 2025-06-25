import React, { useState, useEffect } from 'react';
import './ContactDirectory.css';
import { MdPhoneInTalk, MdVideocam, MdPhoneForwarded, MdFilterAlt, MdSortByAlpha, MdFormatListNumbered, MdFiberManualRecord, MdPower, MdPersonAdd, MdAdd, MdClose } from 'react-icons/md';

function ContactDirectory({ onCallContact, onVideoCallContact, isTransferMode, isAddMode, setShouldInitiateCall, handleTransferClick, t, token, title, isAdmin }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [popupTransparent, setPopupTransparent] = useState(false);
  const [activeTab, setActiveTab] = useState('internal');
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddContactPopup, setShowAddContactPopup] = useState(false);
  const [newContact, setNewContact] = useState({
    extension: '',
    name: '',
    is_internal: 'externe',
    is_admin: false  // Ajout de cette nouvelle propriété
  }); useEffect(() => {
    const fetchContacts = async () => {
      if (!token) {
        setError(t("tokenUnavailable"));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://192.168.1.95:3000/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`${t("httpError")}: ${response.status}`);
        }

        const data = await response.json();
        const contactsWithStatus = data.map(user => ({
          id: user.id,
          name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
          number: user.name,
          extension: user.extension,
          status: user.status || 'offline',
          is_internal: user.is_internal || 'externe' // Assurez-vous que cette propriété est correctement définie
        }));

        setContacts(contactsWithStatus);
        setFilteredContacts(contactsWithStatus);
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

  const handleAddContact = async () => {
    try {
      const response = await fetch('http://192.168.1.95:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Contact added:', result);
      setShowAddContactPopup(false);
      // Rafraîchir la liste des contacts
      // Vous devrez probablement appeler à nouveau la fonction fetchContacts ici
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };


  useEffect(() => {
    let filtered = contacts;

    // Filtrer par onglet (internal/external)
    if (!showAll) {
      filtered = filtered.filter(contact =>
        (activeTab === 'internal' && contact.is_internal === 'interne') ||
        (activeTab === 'external' && contact.is_internal === 'externe')
      );
    }

    // Filtrer par terme de recherche
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.extension.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Trier les contacts
    filtered.sort((a, b) => {
      const compareValue = sortOrder === 'asc' ? 1 : -1;
      if (filterOption === 'name') {
        return a.number.localeCompare(b.number) * compareValue;
      } else if (filterOption === 'extension') {
        return a.extension.localeCompare(b.extension) * compareValue;
      }
      return 0;
    });

    setFilteredContacts(filtered);
  }, [searchTerm, contacts, filterOption, sortOrder, statusFilter, activeTab, showAll]);

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

  const handleStatusFilterClick = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleFilterChange = (option) => {
    setFilterOption(option);
    setFilterOption(option);

  };

  const handleSortOrderChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setShowFilterMenu(false);
  };

  if (error) {
    return <div className="contact-directory"><div className="error-message">{error}</div></div>;
  }

  if (isLoading) {
    return <div className="contact-directory"><div className="loading-message">{t("loadingContacts")}</div></div>;
  }

  
return (
  <div className={`contact-directory ${isTransferMode ? 'transfer-mode' : ''} ${isAddMode ? 'add-mode' : ''}`}>
    <h2>{title || t("directory")}</h2>
    <div className="search-input-container">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder={t('Search by name or extension')}
        className="search-input"
      />
      <button className="add-contact-button" onClick={() => setShowAddContactPopup(true)}>
        <MdAdd />
      </button>
    </div>
    <div className="filter-container">
      <button
        onClick={handleFilterClick}
        className={`filter-button ${showSortOptions ? 'active' : ''}`}
      >
        <MdFilterAlt />
      </button>
      
      {showSortOptions && (
        <>
       <div className='user_type'>
            
      <label className="show-all-checkbox">
        <input
          type="checkbox"

          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
        />
        {t('All')}
      </label>
      
      <div className={`tabs-container ${showAll ? 'hidden' : ''}`}>
        <button
          className={`tab ${activeTab === 'internal' ? 'active' : ''}`}
          onClick={() => setActiveTab('internal')}
        >
          {t('Internal')}
        </button>
        <button
          className={`tab ${activeTab === 'external' ? 'active' : ''}`}
          onClick={() => setActiveTab('external')}
        >
          {t('External')}
        </button>
      </div>
            </div>

        </>
      )}
      
      <div className={`sort-options ${showSortOptions ? 'show' : ''}`}>
          <div
            className={`sort-option ${filterOption === 'name' ? 'active' : ''}`}
            onClick={() => handleFilterChange('name')}
          >
            <MdSortByAlpha />
          </div>
          <div
            className={`sort-option ${filterOption === 'extension' ? 'active' : ''}`}
            onClick={() => handleFilterChange('extension')}
          >
            <MdFormatListNumbered />
        </div>
        <button onClick={handleStatusFilterClick} className="status-filter-button">
          <MdPower />
        </button>
      </div>

      <div className={`status-filter-menu ${showFilterMenu ? 'show' : ''}`}>
        <button className="status-all" onClick={() => handleStatusFilterChange('all')}>
          <span className="status-dot"></span> {t('All')}
        </button>
        <button className="status-online" onClick={() => handleStatusFilterChange('online')}>
          <span className="status-dot"></span> {t('Online')}
        </button>
        <button className="status-offline" onClick={() => handleStatusFilterChange('offline')}>
          <span className="status-dot"></span> {t('Offline')}
        </button>
        <button className="status-dnd" onClick={() => handleStatusFilterChange('dnd')}>
          <span className="status-dot"></span> {t('Do Not Disturb')}
        </button>
      </div>
    </div>

    <div className="contact-list-container">
      {filteredContacts.length === 0 ? (
        <p>{t("noContactsFound")}</p>
      ) : (
        <ul className="contact-list">
          {filteredContacts.map((contact) => (
            <li key={contact.id} className="contact-item">
              <div className="contact-info">
                <MdFiberManualRecord className={`status-dot status-${contact.status}`} />
                <div className="contact-details">
                  <div className="contact-name-extension">
                    <span className="contact-name">{highlightText(contact.name, searchTerm)}</span>
                    <span className="contact-extension">{highlightText(contact.number, searchTerm)}</span>
                  </div>
                  <span className="contact-number">{highlightText(contact.extension, searchTerm)}</span>
                </div>
              </div>
              <div className="contact-actions">
                {isAddMode ? (
                  <button
                    className="add-to-call-button"
                    onClick={() => onCallContact(contact)}
                  >
                    <MdPersonAdd className="add-icon-contacts" />
                  </button>
                ) : isTransferMode ? (
                  <button
                    className="btn-transfer"
                    onClick={() => handleTransferClick(contact)}
                  >
                    <MdPhoneForwarded className="transfer-icon-contacts" />
                  </button>
                ) : (
                  <>
                    <button
                      className="call-button-contacts"
                      onClick={() => {
                        onCallContact(contact.extension);
                        setShouldInitiateCall(true);
                      }}
                    >
                      <MdPhoneInTalk className="call-icon-contacts" />
                    </button>
                    <button
                      className="video-call-button-contacts"
                      onClick={() => {
                        onVideoCallContact(contact.extension);
                        setShouldInitiateCall(true);
                      }}
                    >
                      <MdVideocam className="video-call-icon-contacts" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>

    {showAddContactPopup && (
      <div className="add-contact-popup-overlay">
        <div className="add-contact-popup" style={{ backgroundColor: popupTransparent ? 'transparent' : '' }}>
          <div className="popup-header">
            <button className="close-popup" onClick={() => setShowAddContactPopup(false)}>
              <MdClose />
            </button>
          </div>
          <h3>{t('Add New Contact')}</h3>
          <input
            type="text"
            placeholder={t('Extension')}
            value={newContact.extension}
            onChange={(e) => setNewContact({ ...newContact, extension: e.target.value })}
          />
          <input
            type="text"
            placeholder={t('Name')}
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
          />
          {isAdmin && (
            <>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    value="interne"
                    checked={newContact.is_internal === 'interne'}
                    onChange={(e) => setNewContact({ ...newContact, is_internal: e.target.value, is_admin: false })}
                  />
                  {t('Internal')}
                </label>
                <label>
                  <input
                    type="radio"
                    value="externe"
                    checked={newContact.is_internal === 'externe'}
                    onChange={(e) => setNewContact({ ...newContact, is_internal: e.target.value, is_admin: false })}
                  />
                  {t('External')}
                </label>
              </div>
              {newContact.is_internal === 'interne' && (
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      checked={newContact.is_admin}
                      onChange={() => setNewContact({ ...newContact, is_admin: true })}
                    />
                    {t('Administrator')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={!newContact.is_admin}
                      onChange={() => setNewContact({ ...newContact, is_admin: false })}
                    />
                    {t('Regular User')}
                  </label>
                </div>
              )}
            </>
          )}
          <div className="popup-buttons">
            <button className="add-button" onClick={handleAddContact}>{t('Add Contact')}</button>
            <button className="cancel-button" onClick={() => setShowAddContactPopup(false)}>{t('Cancel')}</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default ContactDirectory;