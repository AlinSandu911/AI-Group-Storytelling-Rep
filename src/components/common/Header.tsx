"use client";

import { useState, useEffect } from 'react';
import { JSX } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/firebase/firestore';
import Modal from '@/components/common/Modal';

type HeaderProps = {
  isChildMode?: boolean;
};

/**
 * Header component with navigation and authentication links
 *
 * @param {Object} props - Component props
 * @param {boolean} [props.isChildMode=false] - Whether to display in child-friendly mode
 * @returns {JSX.Element} Header component
 */
const Header = ({ isChildMode = false }: HeaderProps): JSX.Element => {
  type AuthContextType = {
    user: {
      displayName?: string;
      role?: string;
      uid?: string;
      email?: string;
      photoURL?: string;
    } | null;
    logout: () => Promise<void>;
  };

  const { user, logout } = useAuth() as AuthContextType;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile to get additional info like photoURL
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const getProfilePhotoURL = () => {
    return userProfile?.photoURL || user?.photoURL || null;
  };

  const getUserDisplayName = () => {
    return userProfile?.displayName || user?.displayName || userProfile?.name || 'User';
  };

  const ProfileAvatar = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
    const photoURL = getProfilePhotoURL();
    const displayName = getUserDisplayName();

    const sizeClasses = {
      sm: 'w-6 h-6 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
    };

    if (photoURL) {
      return (
        <img
          src={photoURL}
          alt={`${displayName}'s avatar`}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white ${className}`}
        />
      );
    }

    return (
      <div className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center border-2 border-white ${className}`}>
        <span className="text-indigo-700 font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const toggleProfileDropdown = () => setShowProfileDropdown(!showProfileDropdown);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleParentAccess = () => {
    if (isChildMode) {
      setShowPasswordModal(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      // For development only
      if (process.env.NODE_ENV === 'development' && password === '123456') {
        setShowPasswordModal(false);
        setPassword('');
        router.push('/dashboard');
        return;
      }

      setPasswordError('Incorrect password. Please try again.');
    } catch (error) {
      console.error('Error verifying password:', error);
      setPasswordError('An error occurred while verifying the password. Please try again.');
    }
  };

  const getLinkClass = (path: string) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium";
    return pathname === path
      ? `${baseClass} bg-indigo-800 text-white`
      : `${baseClass} text-indigo-200 hover:bg-indigo-700 hover:text-white`;
  };

  if (isChildMode) {
    return (
      <>
        <header className="bg-indigo-700 shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/kid/dashboard" className="flex items-center">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13..." />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Bedtime Stories</span>
            </Link>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center text-white">
                  <ProfileAvatar size="md" className="mr-2" />
                  <span className="hidden sm:block">Hello, {getUserDisplayName()}!</span>
                </div>
              )}
              <button
                onClick={handleParentAccess}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-500 transition duration-300 text-sm font-medium"
              >
                Parent Access
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-500 transition duration-300 text-sm font-medium"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        </header>

        {showPasswordModal && (
          <Modal
            isOpen={showPasswordModal}
            onClose={() => {
              setShowPasswordModal(false);
              setPassword('');
              setPasswordError('');
            }}
            title="Parent Dashboard Access"
          >
            <div className="p-4">
              <p className="mb-4">Restricted access. Please enter the parent password:</p>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Password"
                autoComplete="current-password"
              />

              {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Access
                </button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  // Regular header for parents and public pages
  return (
    <header className="bg-indigo-700 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">AI Bedtime Story</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              {/* Desktop navigation links */}
              <Link href="/" className={getLinkClass("/")}>
                Home
              </Link>
              <Link href="/about" className={getLinkClass("/about")}>
                About
              </Link>
              <Link href="/contact" className={getLinkClass("/contact")}>
                Contact
              </Link>
              {user && user.role === 'parent' && (
                <>
                  <Link href="/dashboard" className={getLinkClass("/dashboard")}>
                    Dashboard
                  </Link>
                  <Link href="/my-stories" className={getLinkClass("/my-stories")}>
                    My Stories
                  </Link>
                  <Link href="/my-children" className={getLinkClass("/my-children")}>
                    My Children
                  </Link>
                </>
              )}
              {user && user.role === 'child' && (
                <Link href="/kid/dashboard" className={getLinkClass("/kid/dashboard")}>
                  My Stories
                </Link>
              )}
            </div>
          </div>

          {/* Authentication buttons and mobile menu */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center ml-4 md:ml-6">
              {/* Auth buttons - desktop */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={toggleProfileDropdown}
                      className="flex items-center text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium focus:outline-none"
                    >
                      <ProfileAvatar size="sm" className="mr-2" />
                      <span className="mr-2">Hello, {getUserDisplayName()}</span>
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <ProfileAvatar size="md" className="mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <div className="flex items-center">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </div>
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <div className="flex items-center">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                          </div>
                        </Link>
                        <div className="border-t border-gray-100">
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <div className="flex items-center">
                              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Log Out
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white text-indigo-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden ml-2">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-600 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile navigation links */}
            <Link
              href="/"
              className={`${pathname === '/' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`${pathname === '/about' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`${pathname === '/contact' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
            >
              Contact
            </Link>
            {user && user.role === 'parent' && (
              <>
                <Link
                  href="/dashboard"
                  className={`${pathname === '/dashboard' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/my-stories"
                  className={`${pathname === '/my-stories' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
                >
                  My Stories
                </Link>
                <Link
                  href="/my-children"
                  className={`${pathname === '/my-children' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
                >
                  My Children
                </Link>
              </>
            )}
            {user && user.role === 'child' && (
              <Link
                href="/kid/dashboard"
                className={`${pathname === '/kid/dashboard' ? 'bg-indigo-800 text-white' : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'} block px-3 py-2 rounded-md text-base font-medium`}
              >
                My Stories
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-800">
            {/* Mobile auth buttons */}
            <div className="px-2 space-y-1">
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center text-white font-medium">
                    <ProfileAvatar size="sm" className="mr-2" />
                    Hello, {getUserDisplayName()}
                  </div>
                  {/* Mobile Profile Links */}
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileDropdown(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;