import React from 'react';
import { FaHome, FaPhone, FaUser, FaCog, FaSync, FaAddressBook } from 'react-icons/fa';
import './SideMenu.css';

function SideMenu({ onNavigate, currentPage, onRefresh, t }) {
  return (
    <div className="side-menu">
      <button 
        className={`menu-item ${currentPage === 'home' ? 'active' : ''}`} 
        onClick={() => onNavigate('home')}
        title={t('home')}
      >
        <FaHome />
      </button>
      <button 
        className={`menu-item ${currentPage === 'callHistory' ? 'active' : ''}`} 
        onClick={() => onNavigate('callHistory')}
        title={t('callHistory')}
      >
        <FaPhone />
      </button>
      <button 
        className={`menu-item ${currentPage === 'contacts' ? 'active' : ''}`} 
        onClick={() => onNavigate('contacts')}
        title={t('contacts')}
      >
        <FaAddressBook />
      </button>
      <button 
        className={`menu-item ${currentPage === 'profile' ? 'active' : ''}`} 
        onClick={() => onNavigate('profile')}
        title={t('profile')}
      >
        <FaUser />
      </button>
      <button 
        className={`menu-item ${currentPage === 'settings' ? 'active' : ''}`} 
        onClick={() => onNavigate('settings')}
        title={t('settings')}
      >
        <FaCog />
      </button>
      <button 
        className="menu-item"
        onClick={onRefresh}
        title={t('refresh')}
      >
        <FaSync />
      </button>
    </div>
  );
}

export default SideMenu;