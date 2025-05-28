'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { updateUserDisplayName, updateUserEmail, updateUserPassword } from '@/firebase/auth';
import { getUserProfile, updateUserProfile } from '@/firebase/firestore';
import { VOICE_OPTIONS, STORAGE_KEYS } from '@/utils/constants';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/helpers';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Modal from '@/components/common/Modal';

/**
 * Integrated Settings page component
 * 
 * @returns {JSX.Element} Settings page
 */
export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const { children, activeChild, switchActiveChild } = useFamily();
  const router = useRouter();
  
  // Account form state
  const [accountData, setAccountData] = useState({
    displayName: '',
    email: '',
  });
  
  // Application settings state
  const [appSettings, setAppSettings] = useState({
    defaultVoice: VOICE_OPTIONS[0].id,
    theme: 'light',
    notifications: true,
    audioAutoplay: true,
    saveRecentStories: true,
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'preferences', 'family'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load user profile and settings data
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user profile from Firestore
        const profile = await getUserProfile(user.uid);
        
        // Load account data
        setAccountData({
          displayName: user.displayName || '',
          email: user.email || '',
        });
        
        // Try to get settings from local storage
        const savedTheme = loadFromLocalStorage(STORAGE_KEYS.THEME);
        
        // Set app settings from Firestore and local storage
        setAppSettings(prev => ({
          ...prev,
          defaultVoice: profile?.defaultVoice || VOICE_OPTIONS[0].id,
          ...(profile?.settings || {}),
          ...(savedTheme || {}),
        }));
        
        setError(null);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load your settings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    if (user) {
      loadUserData();
    }
  }, [user]);
  
  // Handle account input changes
  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear messages
    setError(null);
    setSuccess(null);
  };
  
  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Use the appropriate value based on input type
    const inputValue = type === 'checkbox' ? checked : value;
    
    setAppSettings(prev => ({
      ...prev,
      [name]: inputValue
    }));
    
    // Clear messages
    setError(null);
    setSuccess(null);
  };
  
  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear messages
    setError(null);
    setSuccess(null);
  };
  
  // Update account settings
  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Update display name if changed
      if (user.displayName !== accountData.displayName) {
        await updateUserDisplayName(accountData.displayName);
      }
      
      // Update email if changed
      if (user.email !== accountData.email) {
        await updateUserEmail(accountData.email);
      }
      
      setSuccess('Account information updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating account:', err);
      setError(err.message || 'Failed to update account information');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update preferences/settings
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Update user profile with app settings
      await updateUserProfile(user.uid, {
        defaultVoice: appSettings.defaultVoice,
        settings: {
          theme: appSettings.theme,
          notifications: appSettings.notifications,
          audioAutoplay: appSettings.audioAutoplay,
          saveRecentStories: appSettings.saveRecentStories,
        }
      });
      
      // Save theme preference to local storage
      saveToLocalStorage(STORAGE_KEYS.THEME, {
        theme: appSettings.theme
      });
      
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to save your settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Update password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccess('Password updated successfully!');
      
      // Close modal
      setIsModalOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state while checking authentication
  if (authLoading || loading) {
    return <LoadingSpinner fullScreen message="Loading settings..." />;
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-indigo-800 mb-6">Account Settings</h1>
          
          {/* Tab navigation */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex -mb-px">
              <button
                className={`mr-1 py-2 px-4 text-center ${
                  activeTab === 'account'
                    ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:border-gray-300 border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('account')}
              >
                Account
              </button>
              <button
                className={`mr-1 py-2 px-4 text-center ${
                  activeTab === 'preferences'
                    ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:text-gray-800 hover:border-gray-300 border-b-2 border-transparent'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                Preferences
              </button>
              {user?.role === 'parent' && (
                <button
                  className={`mr-1 py-2 px-4 text-center ${
                    activeTab === 'family'
                      ? 'border-b-2 border-indigo-500 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:text-gray-800 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                  onClick={() => setActiveTab('family')}
                >
                  Family
                </button>
              )}
            </div>
          </div>
          
          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}
          
          {/* Account settings tab */}
          {activeTab === 'account' && (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">Account Information</h2>
              
              <form onSubmit={handleAccountSubmit}>
                <div className="mb-4">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={accountData.displayName}
                    onChange={handleAccountChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={accountData.email}
                    onChange={handleAccountChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Change Password
                  </button>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {/* Preferences tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                {/* Voice settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Voice Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="defaultVoice" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Text-to-Speech Voice
                      </label>
                      <select
                        id="defaultVoice"
                        name="defaultVoice"
                        value={appSettings.defaultVoice}
                        onChange={handleSettingsChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {VOICE_OPTIONS.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        This voice will be used by default when creating new stories.
                      </p>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="audioAutoplay"
                          checked={appSettings.audioAutoplay}
                          onChange={handleSettingsChange}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Autoplay audio when opening a story
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Appearance settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                        Theme
                      </label>
                      <select
                        id="theme"
                        name="theme"
                        value={appSettings.theme}
                        onChange={handleSettingsChange}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark (Coming Soon)</option>
                        <option value="system">System Preference (Coming Soon)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Other settings */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="notifications"
                          checked={appSettings.notifications}
                          onChange={handleSettingsChange}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Enable notifications (Coming Soon)
                        </span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="saveRecentStories"
                          checked={appSettings.saveRecentStories}
                          onChange={handleSettingsChange}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Save recently viewed stories
                        </span>
                      </label>
                      <p className="ml-6 mt-1 text-xs text-gray-500">
                        Keep track of recently viewed stories for quick access.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {/* Family tab (only for parents) */}
          {activeTab === 'family' && user?.role === 'parent' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-indigo-700 mb-4">Family Management</h2>
                  
                  <p className="text-gray-600 mb-4">
                    Manage your child accounts and monitor their activity.
                  </p>
                  
                  <Button
                    variant="primary"
                    onClick={() => router.push('/my-children')}
                  >
                    Manage Child Accounts
                  </Button>
                </div>
              </div>
              
              {/* Child Account Switcher */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md h-full">
                  <h2 className="text-xl font-semibold text-indigo-700 mb-4">Active Child</h2>
                  
                  {children.length === 0 ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        You haven't created any child accounts yet.
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() => router.push('/my-children')}
                      >
                        Create Child Account
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-4">
                        Currently selected: <span className="font-medium">{activeChild?.name || 'None'}</span>
                      </p>
                      
                      <div className="space-y-2">
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => switchActiveChild(child.id)}
                            className={`w-full p-3 rounded text-left transition-colors ${
                              activeChild?.id === child.id
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <span className="block font-medium">{child.name}</span>
                            {child.age && (
                              <span className="block text-sm text-gray-500">Age: {child.age}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
        
        <Footer />
      </div>
      
      {/* Change Password Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </Modal>
    </ProtectedRoute>
  );
}