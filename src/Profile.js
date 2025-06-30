import React, { useState } from 'react';
import { MdEdit, MdClose } from 'react-icons/md';
import './Profile.css';

const ProfileField = ({ label, type, value, onChange, onEdit, isEditing, isReadOnly, t }) => (
  <div className="profile-field">
    <label>{t(label)}</label>
    {isReadOnly ? (
      <p className="profile-value">{value}</p>
    ) : type === 'textarea' ? (
      <textarea
        value={value}
        readOnly={!isEditing}
        onChange={onChange}
      />
    ) : (
      <input
        type={type}
        value={value}
        readOnly={!isEditing}
        onChange={onChange}
      />
    )}
    {!isReadOnly && !isEditing && (
      <button className="edit-button" onClick={onEdit} title={t('Modify')}>
        <MdEdit />
      </button>
    )}
  </div>
);

function Profile({ onClose, profile, onUpdate, t, handlePhotoChange, isReadOnly = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleEdit = (field) => {
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  const handleSave = () => {
    onUpdate(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const displayName = profile.name || `${profile.prenom || ''} ${profile.nom || ''}`.trim();

  return (
    <div className={`profile-modal ${isReadOnly ? 'full-screen' : ''}`}>
      <div className="profile-header">
        <h2>{isReadOnly ? t('View Profile') : t('Edit Profile')}</h2>
        <button className="close-button" onClick={onClose}>
          <MdClose />
        </button>
      </div>
      <div className="profile-content">
        <div className="profile-photo-container">
          <img
            src={profile.photo || profile.profile_picture}
            alt={t('Profile Picture')}
            className={`profile-photo ${isReadOnly ? 'large' : ''}`}
          />
          {!isReadOnly && (
            <>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
              <label htmlFor="photo-upload" className="change-photo-button">
                {t('Change Photo')}
              </label>
            </>
          )}
        </div>
        <div className="profile-info">
          <ProfileField
            label="Name"
            type="text"
            value={isReadOnly ? displayName : editedProfile.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onEdit={() => handleEdit('name')}
            isEditing={isEditing}
            isReadOnly={isReadOnly}
            t={t}
          />
          <ProfileField
            label="Extension"
            type="text"
            value={profile.extension}
            isReadOnly={true}
            t={t}
          />
          <ProfileField
            label="Email"
            type="email"
            value={isReadOnly ? profile.email : editedProfile.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onEdit={() => handleEdit('email')}
            isEditing={isEditing}
            isReadOnly={isReadOnly}
            t={t}
          />
          <ProfileField
            label="Bio"
            type="textarea"
            value={isReadOnly ? profile.bio : editedProfile.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            onEdit={() => handleEdit('bio')}
            isEditing={isEditing}
            isReadOnly={isReadOnly}
            t={t}
          />
        </div>
      </div>
      {!isReadOnly && isEditing && (
        <div className="profile-actions">
          <button className="save-button" onClick={handleSave}>{t('Save')}</button>
          <button className="cancel-button" onClick={handleCancel}>{t('Cancel')}</button>
        </div>
      )}
    </div>
  );
}

export default Profile;