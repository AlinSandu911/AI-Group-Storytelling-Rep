'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';

/**
 * Child selector component
 * 
 * @param {Object} props
 * @param {Function} props.onSelect - Callback when a child is selected
 * @returns {JSX.Element} Child selector component
 */
export default function ChildSelector({ onSelect }) {
  const { children, activeChild, switchActiveChild, loading } = useFamily();
  
  const handleSelectChild = (childId) => {
    if (switchActiveChild(childId) && onSelect) {
      onSelect(childId);
    }
  };
  
  if (loading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>;
  }
  
  if (!children || children.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-2 border border-gray-200 rounded">
        No child accounts found. Create a child account first.
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Creating story for:
      </label>
      <div className="flex flex-wrap gap-2">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => handleSelectChild(child.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${activeChild?.id === child.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
          >
            {child.name}
          </button>
        ))}
      </div>
    </div>
  );
}
