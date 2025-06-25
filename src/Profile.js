import React, { useState } from 'react';
import { MdEdit } from 'react-icons/md';
import './Profile.css';

const ProfileField = ({ label, type, value, onChange, onEdit, isEditing, t }) => (
  <div className="profile-field">
    <label>{t(label)}</label>
    {type === 'textarea' ? (
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
    {!isEditing && (
      <button className="edit-button" onClick={onEdit} title={t('Modify')}>
        <MdEdit />
      </button>
    )}
  </div>
);

function Profile({ onClose, profile, onUpdate, t, handlePhotoChange }) {
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

//   const handlePhotoChange = (e) => {
//   const file = e.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const base64Image = reader.result;
//       setEditedProfile({ ...editedProfile, photo: base64Image });
//       onUpdate({ ...editedProfile, photo: base64Image }); // Appel à la fonction de mise à jour
//     };
//     reader.readAsDataURL(file);
//   }
// };

  return (
    <div className="profile-modal">
      <h2>{t('Edit Profile')}</h2>
      <div className="profile-photo-container">
  <img
    src={profile.photo}
    alt={t('Profile Picture')}
    className="profile-photo"
  />
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
</div>
      <ProfileField
        label="Name"
        type="text"
        value={editedProfile.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        onEdit={() => handleEdit('name')}
        isEditing={isEditing}
        t={t}
      />
      <ProfileField
        label="Email"
        type="email"
        value={editedProfile.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        onEdit={() => handleEdit('email')}
        isEditing={isEditing}
        t={t}
      />
      <ProfileField
        label="Bio"
        type="textarea"
        value={editedProfile.bio}
        onChange={(e) => handleInputChange('bio', e.target.value)}
        onEdit={() => handleEdit('bio')}
        isEditing={isEditing}
        t={t}
      />
      {isEditing && (
        <div className="profile-actions">
          <button className="save-button" onClick={handleSave}>{t('Save')}</button>
          <button className="cancel-button" onClick={handleCancel}>{t('Cancel')}</button>
        </div>
      )}
      {!isEditing && (
        <button className="close-button" onClick={onClose}>{t('Close')}</button>
      )}
    </div>
  );
}

export default Profile;