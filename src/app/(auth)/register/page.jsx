"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/constants';
import { validatePassword, isValidEmail } from '@/utils/helpers';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

/**
 * Registration page component
 * 
 * @returns {JSX.Element} Registration page
 */
export default function Register() {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: USER_ROLES.PARENT, // Default role is parent
    familyName: '', // Used for parent accounts to create a family
    familyId: '' // Optional, only needed for child accounts
  });
  
  // Error and loading states
  const [error, setError] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState({});
  
  // Hooks
  const { register, loading } = useAuth();
  const router = useRouter();

  /**
   * Handle input changes
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    setError(null);
    
    // Validate password on change
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordErrors({
        isValid: validation.isValid,
        message: validation.message
      });
    }
    
    // Validate password confirmation
    if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmMatch: false,
          confirmMessage: 'Passwords do not match'
        }));
      } else {
        setPasswordErrors((prev) => ({
          ...prev,
          confirmMatch: true,
          confirmMessage: ''
        }));
      }
    }
  };

  /**
   * Validate form before submission
   * 
   * @returns {boolean} Whether form is valid
   */
  const validateForm = () => {
    // Reset errors
    setError(null);
    
    // Email validation
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    
    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return false;
    }
    
    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    // Display name validation
    if (!formData.displayName.trim()) {
      setError('Please enter your name.');
      return false;
    }
    
    // ✅ CORREÇÃO: Family name é opcional para pais
    // Family name validation for parent accounts (opcional)
    // if (formData.role === USER_ROLES.PARENT && !formData.familyName.trim()) {
    //   setError('Please enter a family name.');
    //   return false;
    // }
    
    // Family ID validation for child accounts
    if (formData.role === USER_ROLES.CHILD && !formData.familyId.trim()) {
      setError('Please enter the family ID provided by a parent.');
      return false;
    }
    
    return true;
  };

  /**
   * Handle form submission
   * 
   * @param {Event} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('Registering user with role:', formData.role); // Debug log
      
      // ✅ CORREÇÃO: Passar os parâmetros corretos baseados no role
      await register(
        formData.email,
        formData.password,
        formData.displayName,
        formData.role, // ✅ Usar o role selecionado pelo usuário
        formData.role === USER_ROLES.CHILD ? formData.familyId : null // ✅ Só passa familyId para crianças
      );
      
      // ✅ CORREÇÃO: Redirecionar corretamente baseado no role
      if (formData.role === USER_ROLES.PARENT) {
        router.push('/dashboard');
      } else {
        router.push('/kid/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Display user-friendly error message
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please use a different email or login instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Registration is temporarily disabled. Please try again later.');
      } else if (err.code === 'auth/weak-password') {
        setError('Please choose a stronger password.');
      } else if (err.message?.includes('already registered')) {
        setError('This email is already registered. Please try logging in instead.');
      } else {
        setError(err.message || 'An error occurred during registration. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h1 className="text-3xl font-bold text-center text-indigo-800">Create Your Account</h1>
            <p className="mt-2 text-center text-gray-600">
              Join our community of storytellers
            </p>
          </div>
          
          {error && <ErrorMessage message={error} />}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full px-3 py-2 border ${
                    passwordErrors.isValid === false ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="••••••••"
                />
                {passwordErrors.isValid === false && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters with a number and a symbol.
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full px-3 py-2 border ${
                    passwordErrors.confirmMatch === false ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="••••••••"
                />
                {passwordErrors.confirmMatch === false && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmMessage}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <div
                    className={`cursor-pointer rounded-md border ${
                      formData.role === USER_ROLES.PARENT
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    } px-4 py-3 text-center`}
                    onClick={() => handleChange({ target: { name: 'role', value: USER_ROLES.PARENT } })}
                  >
                    <span className={`text-sm font-medium ${
                      formData.role === USER_ROLES.PARENT ? 'text-indigo-800' : 'text-gray-700'
                    }`}>
                      Parent
                    </span>
                  </div>
                  <div
                    className={`cursor-pointer rounded-md border ${
                      formData.role === USER_ROLES.CHILD
                        ? 'bg-indigo-50 border-indigo-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    } px-4 py-3 text-center`}
                    onClick={() => handleChange({ target: { name: 'role', value: USER_ROLES.CHILD } })}
                  >
                    <span className={`text-sm font-medium ${
                      formData.role === USER_ROLES.CHILD ? 'text-indigo-800' : 'text-gray-700'
                    }`}>
                      Child
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Family Name field - only shown for parent accounts */}
              {formData.role === USER_ROLES.PARENT && (
                <div>
                  <label htmlFor="familyName" className="block text-sm font-medium text-gray-700">
                    Family Name (Optional)
                  </label>
                  <input
                    id="familyName"
                    name="familyName"
                    type="text"
                    value={formData.familyName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., The Smiths"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be used to group all family members and their stories.
                  </p>
                </div>
              )}
              
              {/* Family ID field - only shown for child accounts */}
              {formData.role === USER_ROLES.CHILD && (
                <div>
                  <label htmlFor="familyId" className="block text-sm font-medium text-gray-700">
                    Family ID
                  </label>
                  <input
                    id="familyId"
                    name="familyId"
                    type="text"
                    value={formData.familyId}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter the Family ID provided by a parent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Ask your parent for the Family ID. This links your account to your family&apos;s stories.
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading} 
                fullWidth
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Creating Account...</span>
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}