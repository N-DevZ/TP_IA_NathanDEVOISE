import React, { useState } from 'react';
import './Profile.css';

function Profile({ onClose, profile, onUpdate }) {
  const [localProfile, setLocalProfile] = useState(profile);

  const handleSave = () => {
    onUpdate(localProfile);
    onClose();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalProfile({ ...localProfile, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-modal">
      <h2>Edit Profile</h2>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={localProfile.name}
            onChange={(e) => setLocalProfile({ ...localProfile, name: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={localProfile.email}
            onChange={(e) => setLocalProfile({ ...localProfile, email: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label>
          Bio:
          <textarea
            value={localProfile.bio}
            onChange={(e) => setLocalProfile({ ...localProfile, bio: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label>
          Color:
          <input
            type="color"
            value={localProfile.color}
            onChange={(e) => setLocalProfile({ ...localProfile, color: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label>
          Profile Photo:
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
        </label>
      </div>
      <div>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default Profile;