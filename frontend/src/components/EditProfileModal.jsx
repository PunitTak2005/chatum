import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Camera, Trash2, Check, User, Sparkles } from 'lucide-react';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, isLoading } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatarImage, setAvatarImage] = useState(user?.avatar || null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !user) return null;

  // Process and compress image file
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAvatarImage(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    const fallbackAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || 'user')}`;
    setAvatarImage(fallbackAvatar);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();

    if (!trimmed) {
      setError('Username cannot be empty');
      return;
    }

    if (trimmed.length < 2 || trimmed.length > 30) {
      setError('Username must be between 2 and 30 characters');
      return;
    }

    setError('');
    const finalAvatar = avatarImage || user.avatar;
    const res = await updateUserProfile(trimmed, finalAvatar);

    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 600);
    } else {
      setError(res.error || 'Failed to update profile');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="modal-title" style={{ fontSize: '1.25rem', margin: 0 }}>
            Edit Profile
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload Preview */}
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
              id="edit-profile-file"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                display: 'inline-block',
                position: 'relative',
                cursor: 'pointer',
                padding: 4,
                borderRadius: '50%',
                border: isDragging ? '2px dashed var(--primary-light)' : '2px dashed rgba(255, 255, 255, 0.2)',
                background: isDragging ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                transition: 'var(--transition)'
              }}
            >
              <img
                src={avatarImage || user.avatar}
                alt={user.username}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  border: '3px solid var(--border-subtle)',
                  boxShadow: '0 4px 18px rgba(0, 0, 0, 0.3)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                  border: '2px solid var(--bg-card)'
                }}
                title="Change Photo"
              >
                <Camera size={15} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Camera size={13} />
                <span>Change Photo</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRemoveImage}
                style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}
              >
                <Trash2 size={13} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" htmlFor="edit-username-input" style={{ margin: 0, fontSize: '0.78rem' }}>
                Display Name / Username
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{username.length}/30</span>
            </div>
            <input
              id="edit-username-input"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              maxLength={30}
              placeholder="Enter new display name"
            />
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 6 }}>
                {error}
              </p>
            )}
            {successMsg && (
              <p style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={14} />
                <span>{successMsg}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ flex: 1, padding: '10px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !username.trim()}
              style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
