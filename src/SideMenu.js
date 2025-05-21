import React from 'react';
import { FaHome, FaPhone, FaUser, FaCog, FaSync, FaAddressBook } from 'react-icons/fa';
import './SideMenu.css';

function SideMenu({ onNavigate, currentPage, onRefresh }) {
  return (
    <div className="side-menu">
      <button 
        className={`menu-item ${currentPage === 'home' ? 'active' : ''}`} 
        onClick={() => onNavigate('home')}
        title="Home"
      >
        <FaHome />
      </button>
      <button 
        className={`menu-item ${currentPage === 'callHistory' ? 'active' : ''}`} 
        onClick={() => onNavigate('callHistory')}
        title="Call History"
      >
        <FaPhone />
      </button>
      <button 
        className={`menu-item ${currentPage === 'contacts' ? 'active' : ''}`} 
        onClick={() => onNavigate('contacts')}
        title="Contacts"
      >
        <FaAddressBook />
      </button>
      <button 
        className={`menu-item ${currentPage === 'profile' ? 'active' : ''}`} 
        onClick={() => onNavigate('profile')}
        title="Profile"
      >
        <FaUser />
      </button>
      <button 
        className={`menu-item ${currentPage === 'settings' ? 'active' : ''}`} 
        onClick={() => onNavigate('settings')}
        title="Settings"
      >
        <FaCog />
      </button>
      <button 
        className="menu-item"
        onClick={onRefresh}
        title="Refresh"
      >
        <FaSync />
      </button>
    </div>
  );
}

export default SideMenu;