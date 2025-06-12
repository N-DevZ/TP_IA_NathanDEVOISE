import React from 'react';
import './CustomTitleBar.css';

let ipcRenderer;
if (window.require) {
  try {
    const electron = window.require('electron');
    ipcRenderer = electron.ipcRenderer;
  } catch (error) {
    console.error('Failed to load electron:', error);
  }
}

function CustomTitleBar() {
  const handleMinimize = () => {
    if (ipcRenderer) ipcRenderer.send('minimize-window');
  };

  const handleMaximize = () => {
    if (ipcRenderer) ipcRenderer.send('maximize-window');
  };

  const handleClose = () => {
    if (ipcRenderer) ipcRenderer.send('close-window');
  };

  return (
    <div className="custom-titlebar">
      <div className="titlebar-drag-region"></div>
      <div className="window-title">MiloSIP</div>
      <div className="window-controls">
        <button className="control-btn minimize-btn" onClick={handleMinimize}>&#8211;</button>
        <button className="control-btn maximize-btn" onClick={handleMaximize}>&#9633;</button>
        <button className="control-btn close-btn" onClick={handleClose}>&#10005;</button>
      </div>
    </div>
  );
}

export default CustomTitleBar;