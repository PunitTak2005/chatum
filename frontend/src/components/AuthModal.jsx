import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { MessageSquare, Sparkles, Upload, Camera, Trash2, ArrowRight, ShieldCheck, Image as ImageIcon } from 'lucide-react';

export const AuthModal = () => {
  const { loginWithUsername, isLoading, authError } = useAuth();
  const [username, setUsername] = useState('');
  const [avatarImage, setAvatarImage] = useState(null);
  const [localError, setLocalError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to compress and convert image file to Data URL
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image size must be less than 5MB');
      return;
    }

    setLocalError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 256x256 for optimal real-time performance
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
    setAvatarImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalUsername = username.trim();

    if (!finalUsername) {
      setLocalError('Please enter your username');
      return;
    }

    if (finalUsername.length < 2) {
      setLocalError('Username must be at least 2 characters');
      return;
    }

    setLocalError('');
    // Use uploaded photo, or generate avatar based on username
    const finalAvatar = avatarImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalUsername)}`;
    await loginWithUsername(finalUsername, finalAvatar);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: 440 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="modal-hero-logo">
            <img src="/avatars/chatum.png" alt="Chatum Logo" />
          </div>
          <h1 className="modal-title" style={{ fontSize: '1.45rem', marginBottom: 6 }}>
            Join Chatum
          </h1>
          <p className="modal-subtitle" style={{ fontSize: '0.86rem', margin: 0 }}>
            Upload your profile photo and choose a display name
          </p>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit}>
          {/* Profile Image Upload Zone */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: 8, display: 'block', textAlign: 'center' }}>
              Profile Photo
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-file-input"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: isDragging ? '2px dashed var(--primary-light)' : '2px dashed var(--border-subtle)',
                background: isDragging ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                position: 'relative'
              }}
            >
              {avatarImage ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={avatarImage}
                    alt="Profile Preview"
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary-light)',
                      boxShadow: '0 0 16px rgba(99, 102, 241, 0.35)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Remove Photo"
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--danger)',
                      color: '#fff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                  <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.74rem', color: 'var(--primary-light)', fontWeight: 500 }}>
                    Click or drag to change
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                      color: 'var(--accent-cyan)'
                    }}
                  >
                    <Camera size={26} />
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 2 }}>
                    Upload Profile Picture
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Drag & drop or browse PNG, JPG, WebP
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Username Input */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="form-label" htmlFor="username-input" style={{ margin: 0, fontSize: '0.78rem' }}>
                Username
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{username.length}/30</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="username-input"
                type="text"
                className="form-input"
                placeholder="Enter a username..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (localError) setLocalError('');
                }}
                maxLength={30}
                autoFocus
              />
            </div>
            {(localError || authError) && (
              <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 6 }}>
                {localError || authError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !username.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              fontSize: '0.95rem'
            }}
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Enter Chat</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, color: 'var(--text-dim)', fontSize: '0.75rem' }}>
          <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
          <span>Real-time WebSocket session • Instant delivery</span>
        </div>
      </div>
    </div>
  );
};
