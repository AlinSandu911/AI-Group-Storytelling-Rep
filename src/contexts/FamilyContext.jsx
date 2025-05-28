'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserProfile,
  getChildAccounts, 
  createChildAccount, 
  updateChildAccount, 
  deleteChildAccount 
} from '@/firebase/firestore';

// Create context
const FamilyContext = createContext();

// Context provider component
export function FamilyProvider({ children }) {
  const { user } = useAuth();
  const [familyChildren, setFamilyChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch children accounts when user changes
  useEffect(() => {
    async function fetchChildren() {
      if (!user || user.role !== 'parent') {
        setFamilyChildren([]);
        setActiveChild(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userProfile = await getUserProfile(user.uid);
        
        // Make sure the user has a familyId
        if (!userProfile?.familyId) {
          setError('Family ID not found. Please contact support.');
          setLoading(false);
          return;
        }

        // Get all children accounts associated with this family
        const childAccounts = await getChildAccounts(userProfile.familyId);
        setFamilyChildren(childAccounts);
        
        // Set active child from localStorage if available
        const savedActiveChildId = localStorage.getItem('activeChildId');
        if (savedActiveChildId && childAccounts.length > 0) {
          const foundChild = childAccounts.find(child => child.id === savedActiveChildId);
          setActiveChild(foundChild || childAccounts[0]);
        } else if (childAccounts.length > 0) {
          setActiveChild(childAccounts[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching child accounts:', err);
        setError('Failed to load child accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchChildren();
  }, [user]);

  // Save active child to localStorage when it changes
  useEffect(() => {
    if (activeChild) {
      localStorage.setItem('activeChildId', activeChild.id);
    }
  }, [activeChild]);

  // Add a new child account
  const addChild = async (childData) => {
    if (!user || user.role !== 'parent') {
      setError('Only parents can add child accounts');
      return null;
    }

    try {
      setLoading(true);
      const userProfile = await getUserProfile(user.uid);
      
      if (!userProfile?.familyId) {
        setError('Family ID not found. Please contact support.');
        return null;
      }

      // Create the child account
      const childAccount = await createChildAccount({
        ...childData,
        familyId: userProfile.familyId,
        parentId: user.uid
      });

      // Update local state
      setFamilyChildren(prev => [...prev, childAccount]);
      
      // If this is the first child, set as active
      if (!activeChild) {
        setActiveChild(childAccount);
      }
      
      return childAccount;
    } catch (err) {
      console.error('Error creating child account:', err);
      setError('Failed to create child account. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a child account
  const updateChild = async (childId, childData) => {
    if (!user || user.role !== 'parent') {
      setError('Only parents can update child accounts');
      return false;
    }

    try {
      setLoading(true);
      
      // Update the child account
      await updateChildAccount(childId, childData);
      
      // Update local state
      setFamilyChildren(prev => 
        prev.map(child => 
          child.id === childId ? { ...child, ...childData } : child
        )
      );
      
      // Update active child if needed
      if (activeChild && activeChild.id === childId) {
        setActiveChild(prev => ({ ...prev, ...childData }));
      }
      
      return true;
    } catch (err) {
      console.error('Error updating child account:', err);
      setError('Failed to update child account. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a child account
  const removeChild = async (childId) => {
    if (!user || user.role !== 'parent') {
      setError('Only parents can remove child accounts');
      return false;
    }

    try {
      setLoading(true);
      
      // Delete the child account
      await deleteChildAccount(childId);
      
      // Update local state
      setFamilyChildren(prev => prev.filter(child => child.id !== childId));
      
      // If the active child was deleted, set a new active child
      if (activeChild && activeChild.id === childId) {
        setActiveChild(familyChildren.length > 1 ? familyChildren.find(child => child.id !== childId) : null);
      }
      
      return true;
    } catch (err) {
      console.error('Error removing child account:', err);
      setError('Failed to remove child account. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Set a specific child as active
  const switchActiveChild = (childId) => {
    const child = familyChildren.find(c => c.id === childId);
    if (child) {
      setActiveChild(child);
      return true;
    }
    return false;
  };

  // Context values to expose
  const contextValue = {
    children: familyChildren,
    activeChild,
    loading,
    error,
    addChild,
    updateChild,
    removeChild,
    switchActiveChild
  };

  return (
    <FamilyContext.Provider value={contextValue}>
      {children}
    </FamilyContext.Provider>
  );
}

// Custom hook to use the family context
export const useFamily = () => {
  const context = useContext(FamilyContext);
  
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  
  return context;
};