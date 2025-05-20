import React from 'react';
import './CustomTitleBar.css';

let ipcRenderer;
if (window.require) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}

function CustomTitleBar() {
  return (
    <div className="custom-titlebar">
      <div className="titlebar-drag-region"></div>
      <div className="window-title">MiloSIP</div>
      <div className="window-controls">
        <button className="control-btn minimize-btn" onClick={() => ipcRenderer.send('minimize-window')}>&#8211;</button>
        <button className="control-btn maximize-btn" onClick={() => ipcRenderer.send('maximize-window')}>&#9633;</button>
        <button className="control-btn close-btn" onClick={() => ipcRenderer.send('close-window')}>&#10005;</button>
      </div>
    </div>
  );
}

export default CustomTitleBar;