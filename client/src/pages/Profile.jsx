import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import Badge from '../components/common/Badge';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';

const presetAvatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const t = useT();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'United States',
    avatar: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Synchronize initial user state into form fields
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || 'United States',
        avatar: user.avatar || presetAvatars[0],
      });
    }
  }, [user]);

  // Handle local image file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(t('profile.invalidImage'), 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      showToast(t('profile.imageTooBig'), 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
        showToast(t('profile.photoUploaded'), 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    showToast(t('profile.avatarSelected'), 'info');
  };

  const handleApplyUrl = () => {
    if (customUrl.trim() && (customUrl.startsWith('http://') || customUrl.startsWith('https://'))) {
      setFormData((prev) => ({ ...prev, avatar: customUrl.trim() }));
      setCustomUrl('');
      setShowUrlInput(false);
      showToast(t('profile.photoUrlApplied'), 'info');
    } else {
      showToast(t('profile.invalidUrl'), 'error');
    }
  };

  // Submit profile details (Name, Email, Phone, Address, Avatar)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authService.updateProfile(formData);
      if (res.success && res.data) {
        updateUser(res.data);
        showToast(t('profile.saved'), 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Submit Password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast(t('auth.passwordMismatch'), 'error');
      return;
    }

    if (passwords.newPassword.length < 8) {
      showToast(t('auth.passwordLength'), 'warning');
      return;
    }

    try {
      setChangingPass(true);
      const res = await authService.updatePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      if (res.success) {
        showToast(t('profile.passwordUpdated'), 'success');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 20px', maxWidth: '1000px' }}>
        {/* Top Profile Banner Card */}
        <div
          className="card"
          style={{
            padding: '32px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(255, 19, 97, 0.08) 100%), var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Avatar with Camera Overlay Trigger */}
            <div style={{ position: 'relative' }}>
              <img
                src={formData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={formData.name || 'User'}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--accent)',
                  boxShadow: 'var(--shadow-md)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  insetInlineEnd: 0,
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--bg-surface)',
                  border: '2px solid var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
                title={t('profile.changePhoto')}
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                  }}
                >
                  {user?.name}
                </h1>
                <Badge variant={user?.role === 'admin' ? 'accent' : 'primary'}>
                  {t(`profile.role_${user?.role}`)}
                </Badge>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '4px' }}>
                📧 {user?.email}
              </p>
              {user?.phone && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  📱 {user.phone}
                </p>
              )}
            </div>
          </div>

          {/* Quick upload photo buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              📁 {t('profile.uploadPhoto')}
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="btn btn-outline btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              🔗 {t('profile.pasteUrl')}
            </button>
          </div>
        </div>

        {/* Optional Image URL Input Bar */}
        {showUrlInput && (
          <div
            className="card"
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <input
              type="url"
              placeholder={t('profile.urlPlaceholder')}
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="input-field"
              style={{ flexGrow: 1 }}
            />
            <button type="button" onClick={handleApplyUrl} className="btn btn-primary btn-sm">
              {t('profile.applyUrl')}
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="btn btn-outline btn-sm"
            >
              {t('common.cancel')}
            </button>
          </div>
        )}

        {/* Preset Avatars Selection Row */}
        <div className="card" style={{ padding: '20px', marginBottom: '32px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '12px' }}>
            ✨ {t('profile.presetAvatar')}
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
            {presetAvatars.map((avatarUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(avatarUrl)}
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  padding: 0,
                  border: formData.avatar === avatarUrl ? '3px solid var(--accent)' : '2px solid var(--border-subtle)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'none',
                  flexShrink: 0,
                  transform: formData.avatar === avatarUrl ? 'scale(1.08)' : 'scale(1)',
                  transition: 'var(--transition)',
                }}
              >
                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Two Forms Grid: Profile Details & Password */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {/* 1. Profile Information Form */}
          <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '20px',
                color: 'var(--text-main)',
              }}
            >
              👤 {t('profile.editInfo')}
            </h3>

            <form onSubmit={handleProfileSubmit}>
              {/* Name / Username */}
              <div className="input-group">
                <label className="input-label">{t('auth.fullName')}</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder={t('auth.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email Address */}
              <div className="input-group">
                <label className="input-label">{t('auth.email')}</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Phone Number */}
              <div className="input-group">
                <label className="input-label">{t('checkout.phone')}</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Street Delivery Address */}
              <div className="input-group">
                <label className="input-label">{t('checkout.address')}</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={t('checkout.addressPlaceholder')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="input-group">
                  <label className="input-label">{t('checkout.city')}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('checkout.city')}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">{t('checkout.country')}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={t('checkout.country')}
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn btn-flash"
                style={{ width: '100%', marginTop: '10px', padding: '14px', borderRadius: 'var(--radius-md)' }}
              >
                {savingProfile ? t('profile.saving') : `💾 ${t('profile.save')}`}
              </button>
            </form>
          </div>

          {/* 2. Change Password Form */}
          <div className="card" style={{ padding: '28px', borderRadius: 'var(--radius-xl)' }}>
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '20px',
                color: 'var(--text-main)',
              }}
            >
              🔒 {t('profile.changePassword')}
            </h3>

            <form onSubmit={handlePasswordSubmit}>
              {/* Current Password */}
              <div className="input-group">
                <label className="input-label">{t('profile.currentPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    className="input-field"
                    placeholder={t('profile.currentPassword')}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    style={{ paddingInlineEnd: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    style={{
                      position: 'absolute',
                      insetInlineEnd: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {showCurrentPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="input-group">
                <label className="input-label">{t('profile.newPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    className="input-field"
                    placeholder={t('auth.passwordHint')}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    style={{ paddingInlineEnd: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    style={{
                      position: 'absolute',
                      insetInlineEnd: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {showNewPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="input-group">
                <label className="input-label">{t('profile.confirmNewPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    className="input-field"
                    placeholder={t('auth.confirmPlaceholder')}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    style={{ paddingInlineEnd: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    style={{
                      position: 'absolute',
                      insetInlineEnd: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {showConfirmPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '10px', padding: '14px', borderRadius: 'var(--radius-md)', fontWeight: 800 }}
              >
                {changingPass ? t('profile.updatingPassword') : `🔑 ${t('profile.updatePassword')}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
