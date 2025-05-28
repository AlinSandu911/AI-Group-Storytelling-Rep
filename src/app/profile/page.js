"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserDisplayName, updateUserEmail, updateUserPassword } from '@/firebase/auth';
import { getUserProfile, updateUserProfile } from '@/firebase/firestore';
import { uploadProfileImage, deleteProfileImage } from '@/firebase/storage'; // Você precisará criar este arquivo
import { isValidEmail, validatePassword } from '@/utils/helpers';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';

/**
 * Profile page component
 * 
 * @returns {JSX.Element} Profile page
 */
export default function Profile() {
  // State
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    familyId: '',
    role: '',
    photoURL: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [imageUpload, setImageUpload] = useState({
    file: null,
    preview: null,
    uploading: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({
    profile: null,
    email: null,
    password: null,
    image: null,
  });
  
  const [success, setSuccess] = useState({
    profile: false,
    email: false,
    password: false,
    image: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState({
    profile: false,
    email: false,
    password: false,
  });
  
  // Refs
  const fileInputRef = useRef(null);
  
  // Hooks
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  
  // Fetch user profile data
  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    // Fetch user profile if logged in
    if (user) {
      const fetchUserProfile = async () => {
        try {
          setLoading(true);
          
          // Get additional user profile data
          const userProfile = await getUserProfile(user.uid);
          
          // Set profile data
          setProfileData({
            displayName: user.displayName || '',
            email: user.email || '',
            familyId: userProfile?.familyId || user.familyId || '',
            role: userProfile?.role || user.role || '',
            photoURL: userProfile?.photoURL || user.photoURL || '',
          });
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError(prev => ({
            ...prev,
            profile: 'Failed to load your profile. Please try again later.'
          }));
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserProfile();
    }
  }, [user, authLoading, router]);
  
  /**
   * Handle profile data changes
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error and success when user types
    setError(prev => ({
      ...prev,
      profile: null
    }));
    
    setSuccess(prev => ({
      ...prev,
      profile: false
    }));
  };
  
  /**
   * Handle password data changes
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error and success when user types
    setError(prev => ({
      ...prev,
      password: null
    }));
    
    setSuccess(prev => ({
      ...prev,
      password: false
    }));
  };
  
  /**
   * Handle image file selection
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(prev => ({
        ...prev,
        image: 'Please select a valid image file.'
      }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(prev => ({
        ...prev,
        image: 'Image must be smaller than 5MB.'
      }));
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImageUpload({
        file,
        preview: reader.result,
        uploading: false,
      });
      
      setError(prev => ({
        ...prev,
        image: null
      }));
    };
    reader.readAsDataURL(file);
  };
  
  /**
   * Handle image upload
   */
  const handleImageUpload = async () => {
    if (!imageUpload.file) return;
    
    try {
      setImageUpload(prev => ({ ...prev, uploading: true }));
      setError(prev => ({ ...prev, image: null }));
      
      // Upload image to Firebase Storage
      const photoURL = await uploadProfileImage(user.uid, imageUpload.file);
      
      // Update user profile with new photo URL
      await updateUserProfile(user.uid, { photoURL });
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        photoURL
      }));
      
      // Clear upload state
      setImageUpload({
        file: null,
        preview: null,
        uploading: false,
      });
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh user context to update header
      if (refreshUser) {
        await refreshUser();
      }
      
      setSuccess(prev => ({
        ...prev,
        image: true
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(prev => ({
        ...prev,
        image: 'Failed to upload image. Please try again.'
      }));
    } finally {
      setImageUpload(prev => ({ ...prev, uploading: false }));
    }
  };
  
  /**
   * Handle image removal
   */
  const handleImageRemove = async () => {
    try {
      setImageUpload(prev => ({ ...prev, uploading: true }));
      
      // Delete image from Firebase Storage if exists
      if (profileData.photoURL) {
        await deleteProfileImage(user.uid);
      }
      
      // Update user profile to remove photo URL
      await updateUserProfile(user.uid, { photoURL: null });
      
      // Update local state
      setProfileData(prev => ({
        ...prev,
        photoURL: ''
      }));
      
      // Clear upload state
      setImageUpload({
        file: null,
        preview: null,
        uploading: false,
      });
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh user context to update header
      if (refreshUser) {
        await refreshUser();
      }
      
      setSuccess(prev => ({
        ...prev,
        image: true
      }));
    } catch (err) {
      console.error('Error removing image:', err);
      setError(prev => ({
        ...prev,
        image: 'Failed to remove image. Please try again.'
      }));
    } finally {
      setImageUpload(prev => ({ ...prev, uploading: false }));
    }
  };
  
  /**
   * Cancel image upload
   */
  const cancelImageUpload = () => {
    setImageUpload({
      file: null,
      preview: null,
      uploading: false,
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setError(prev => ({
      ...prev,
      image: null
    }));
  };
  
  /**
   * Handle profile update
   */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(prev => ({ ...prev, profile: true }));
      setError(prev => ({ ...prev, profile: null }));
      setSuccess(prev => ({ ...prev, profile: false }));
      
      // Validate display name
      if (!profileData.displayName.trim()) {
        setError(prev => ({
          ...prev,
          profile: 'Please enter your name.'
        }));
        setIsSubmitting(prev => ({ ...prev, profile: false }));
        return;
      }
      
      // Update display name in Firebase Auth and Firestore
      await updateUserDisplayName(profileData.displayName);
      
      // Update additional profile data in Firestore
      await updateUserProfile(user.uid, {
        displayName: profileData.displayName,
      });
      
      // Refresh user context to update header
      if (refreshUser) {
        await refreshUser();
      }
      
      // Show success message
      setSuccess(prev => ({
        ...prev,
        profile: true
      }));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(prev => ({
        ...prev,
        profile: 'Failed to update your profile. Please try again later.'
      }));
    } finally {
      setIsSubmitting(prev => ({ ...prev, profile: false }));
    }
  };
  
  /**
   * Handle email update
   */
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(prev => ({ ...prev, email: true }));
      setError(prev => ({ ...prev, email: null }));
      setSuccess(prev => ({ ...prev, email: false }));
      
      // Validate email
      if (!isValidEmail(profileData.email)) {
        setError(prev => ({
          ...prev,
          email: 'Please enter a valid email address.'
        }));
        setIsSubmitting(prev => ({ ...prev, email: false }));
        return;
      }
      
      // Validate current password
      if (!passwordData.currentPassword) {
        setError(prev => ({
          ...prev,
          email: 'Please enter your current password to update your email.'
        }));
        setIsSubmitting(prev => ({ ...prev, email: false }));
        return;
      }
      
      // Update email in Firebase Auth and Firestore
      await updateUserEmail(profileData.email, passwordData.currentPassword);
      
      // Update additional profile data in Firestore
      await updateUserProfile(user.uid, {
        email: profileData.email,
      });
      
      // Show success message
      setSuccess(prev => ({
        ...prev,
        email: true
      }));
      
      // Clear current password
      setPasswordData(prev => ({
        ...prev,
        currentPassword: ''
      }));
    } catch (err) {
      console.error('Error updating email:', err);
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/wrong-password') {
        setError(prev => ({
          ...prev,
          email: 'Incorrect password. Please try again.'
        }));
      } else if (err.code === 'auth/email-already-in-use') {
        setError(prev => ({
          ...prev,
          email: 'This email is already in use. Please use a different email.'
        }));
      } else {
        setError(prev => ({
          ...prev,
          email: 'Failed to update your email. Please try again later.'
        }));
      }
    } finally {
      setIsSubmitting(prev => ({ ...prev, email: false }));
    }
  };
  
  /**
   * Handle password update
   */
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(prev => ({ ...prev, password: true }));
      setError(prev => ({ ...prev, password: null }));
      setSuccess(prev => ({ ...prev, password: false }));
      
      // Validate current password
      if (!passwordData.currentPassword) {
        setError(prev => ({
          ...prev,
          password: 'Please enter your current password.'
        }));
        setIsSubmitting(prev => ({ ...prev, password: false }));
        return;
      }
      
      // Validate new password
      const passwordValidation = validatePassword(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        setError(prev => ({
          ...prev,
          password: passwordValidation.message
        }));
        setIsSubmitting(prev => ({ ...prev, password: false }));
        return;
      }
      
      // Check if passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError(prev => ({
          ...prev,
          password: 'Passwords do not match.'
        }));
        setIsSubmitting(prev => ({ ...prev, password: false }));
        return;
      }
      
      // Update password in Firebase Auth
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Show success message
      setSuccess(prev => ({
        ...prev,
        password: true
      }));
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error updating password:', err);
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/wrong-password') {
        setError(prev => ({
          ...prev,
          password: 'Incorrect current password. Please try again.'
        }));
      } else {
        setError(prev => ({
          ...prev,
          password: 'Failed to update your password. Please try again later.'
        }));
      }
    } finally {
      setIsSubmitting(prev => ({ ...prev, password: false }));
    }
  };
  
  // Show loading state
  if (loading || authLoading) {
    return <LoadingSpinner fullScreen message="Loading your profile..." />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-indigo-800 mb-8">Your Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar with user info */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center mb-6">
                {/* Profile Image */}
                <div className="relative mb-4">
                  {profileData.photoURL || imageUpload.preview ? (
                    <img
                      src={imageUpload.preview || profileData.photoURL}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-indigo-100">
                      <span className="text-indigo-700 text-3xl font-semibold">
                        {profileData.displayName ? profileData.displayName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                  )}
                  
                  {/* Image upload controls */}
                  <div className="absolute -bottom-2 -right-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                      disabled={imageUpload.uploading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                
                {/* Image upload actions */}
                {imageUpload.file && (
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={handleImageUpload}
                      disabled={imageUpload.uploading}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {imageUpload.uploading ? 'Uploading...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelImageUpload}
                      disabled={imageUpload.uploading}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {/* Remove image button */}
                {profileData.photoURL && !imageUpload.file && (
                  <button
                    onClick={handleImageRemove}
                    disabled={imageUpload.uploading}
                    className="text-red-600 text-sm hover:text-red-700 mb-4 disabled:opacity-50"
                  >
                    Remove Photo
                  </button>
                )}
                
                {/* Image errors and success */}
                {error.image && (
                  <div className="text-red-600 text-sm mb-4 text-center">{error.image}</div>
                )}
                {success.image && (
                  <div className="text-green-600 text-sm mb-4 text-center">Profile photo updated!</div>
                )}
                
                <h2 className="text-xl font-semibold">{profileData.displayName}</h2>
                <p className="text-gray-600">{profileData.email}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="text-gray-700 font-medium capitalize">{profileData.role}</p>
                </div>
                
                {profileData.role === 'parent' && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Family ID</p>
                    <p className="text-gray-700 font-medium">{profileData.familyId}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Share this ID with your children to link their accounts to your family.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile settings forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Update profile */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              
              {error.profile && <ErrorMessage message={error.profile} />}
              {success.profile && <SuccessMessage message="Profile updated successfully!" />}
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleProfileChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting.profile}
                  >
                    {isSubmitting.profile ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Update email */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Email Address</h2>
              
              {error.email && <ErrorMessage message={error.email} />}
              {success.email && <SuccessMessage message="Email updated successfully!" />}
              
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="currentPasswordForEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPasswordForEmail"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your current password to confirm"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting.email}
                  >
                    {isSubmitting.email ? 'Updating...' : 'Update Email'}
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Update password */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              
              {error.password && <ErrorMessage message={error.password} />}
              {success.password && <SuccessMessage message="Password updated successfully!" />}
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
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
                  />
                </div>
                
                <div>
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
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long and include a letter and a number.
                  </p>
                </div>
                
                <div>
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
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isSubmitting.password}
                  >
                    {isSubmitting.password ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}