import React, { useState, useEffect } from 'react';
import './ContactDirectory.css';
import { MdPhoneInTalk, MdVideocam, MdPhoneForwarded, MdFilterAlt, MdSortByAlpha, MdFormatListNumbered, MdFiberManualRecord, MdPower, MdPersonAdd } from 'react-icons/md';

function ContactDirectory({ onCallContact, onVideoCallContact, isTransferMode, isAddMode, setShouldInitiateCall, handleTransferClick, t, token, title }) {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
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
          status: user.status || 'offline'
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

  useEffect(() => {
    let filtered = contacts;

    if (searchTerm.trim() !== '') {
      filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.extension.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

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
  }, [searchTerm, contacts, filterOption, sortOrder, statusFilter]);

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
      </div>
      <div className="filter-container">
        <button
          onClick={handleFilterClick}
          className={`filter-button ${showSortOptions ? 'active' : ''}`}
        >
          <MdFilterAlt />
        </button>

        <div className={`sort-options ${showSortOptions ? 'show' : ''}`}>
          <div className="sort-options-center">
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
    </div>
  );
}

export default ContactDirectory;