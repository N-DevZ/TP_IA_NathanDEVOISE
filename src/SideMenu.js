import React from 'react';
import { MdHome, MdHistory, MdContacts, MdFace, MdSettings, MdRefresh} from 'react-icons/md';
import './SideMenu.css';

function SideMenu({ onNavigate, currentPage, onRefresh, t }) {
  return (
    <div className="side-menu">
      <button 
        className={`menu-item ${currentPage === 'home' ? 'active' : ''}`} 
        onClick={() => onNavigate('home')}
        title={t('home')}
      >
        <MdHome />
      </button>
      <button 
        className={`menu-item ${currentPage === 'callHistory' ? 'active' : ''}`} 
        onClick={() => onNavigate('callHistory')}
        title={t('callHistory')}
      >
        <MdHistory />
      </button>
      <button 
        className={`menu-item ${currentPage === 'contacts' ? 'active' : ''}`} 
        onClick={() => onNavigate('contacts')}
        title={t('contacts')}
      >
        <MdContacts />
      </button>
      <button 
        className={`menu-item ${currentPage === 'profile' ? 'active' : ''}`} 
        onClick={() => onNavigate('profile')}
        title={t('profile')}
      >
        <MdFace />
      </button>
      <button 
        className={`menu-item ${currentPage === 'settings' ? 'active' : ''}`} 
        onClick={() => onNavigate('settings')}
        title={t('settings')}
      >
        <MdSettings />
      </button>
      <button 
        className="menu-item"
        onClick={onRefresh}
        title={t('refresh')}
      >
        <MdRefresh />
      </button>
    </div>
  );
}

export default SideMenu;