'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import SuccessMessage from '@/components/common/SuccessMessage';

/**
 * Child accounts manager component
 * 
 * @returns {JSX.Element} Child accounts manager component
 */
export default function ChildAccountsManager() {
  const { children, loading, error, addChild, updateChild, removeChild } = useFamily();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', preferences: '' });
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Open add child modal
  const handleAddClick = () => {
    setFormData({ name: '', age: '', preferences: '' });
    setIsAddModalOpen(true);
  };
  
  // Open edit child modal
  const handleEditClick = (child) => {
    setSelectedChild(child);
    setFormData({
      name: child.name || '',
      age: child.age || '',
      preferences: child.preferences || ''
    });
    setIsEditModalOpen(true);
  };
  
  // Open delete child modal
  const handleDeleteClick = (child) => {
    setSelectedChild(child);
    setIsDeleteModalOpen(true);
  };
  
  // Add a new child
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      return;
    }
    
    const result = await addChild(formData);
    
    if (result) {
      setSuccessMessage(`Child account "${formData.name}" created successfully!`);
      setIsAddModalOpen(false);
      setFormData({ name: '', age: '', preferences: '' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };
  
  // Edit a child
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim() || !selectedChild) {
      return;
    }
    
    const result = await updateChild(selectedChild.id, formData);
    
    if (result) {
      setSuccessMessage(`Child account "${formData.name}" updated successfully!`);
      setIsEditModalOpen(false);
      setSelectedChild(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };
  
  // Delete a child
  const handleDeleteConfirm = async () => {
    if (!selectedChild) {
      return;
    }
    
    const result = await removeChild(selectedChild.id);
    
    if (result) {
      setSuccessMessage(`Child account "${selectedChild.name}" deleted successfully!`);
      setIsDeleteModalOpen(false);
      setSelectedChild(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-indigo-800 mb-2">Child Accounts</h2>
        <p className="text-gray-600">
          Manage your children's accounts to personalize their story experiences.
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {successMessage && <SuccessMessage message={successMessage} />}
      
      <div className="mb-6">
        <Button
          variant="primary"
          onClick={handleAddClick}
          disabled={loading}
        >
          Add Child Account
        </Button>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : children.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-12 w-12 text-gray-400 mx-auto mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Child Accounts</h3>
          <p className="text-gray-500 mb-4">
            Create your first child account to start personalizing their story experience.
          </p>
          <Button variant="primary" onClick={handleAddClick}>
            Add Child Account
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map(child => (
            <div 
              key={child.id}
              className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 transition-all hover:shadow-md"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-indigo-700 mb-1">
                  {child.name}
                </h3>
                {child.age && (
                  <p className="text-sm text-gray-600 mb-1">
                    Age: {child.age}
                  </p>
                )}
                {child.preferences && (
                  <p className="text-sm text-gray-600">
                    Preferences: {child.preferences}
                  </p>
                )}
              </div>
              <div className="bg-gray-100 px-4 py-3 flex justify-end space-x-2">
                <button
                  onClick={() => handleEditClick(child)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(child)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Child Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Child Account"
      >
        <form onSubmit={handleAddSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Child's Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter child's name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Child's Age
            </label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter child's age"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="preferences" className="block text-sm font-medium text-gray-700 mb-1">
              Story Preferences (optional)
            </label>
            <textarea
              id="preferences"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              rows="3"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="E.g., favorite themes, characters, or topics"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              type="submit"
            >
              Add Child Account
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Edit Child Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Child Account"
      >
        <form onSubmit={handleEditSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Child's Name
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter child's name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="edit-age" className="block text-sm font-medium text-gray-700 mb-1">
              Child's Age
            </label>
            <input
              type="text"
              id="edit-age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter child's age"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="edit-preferences" className="block text-sm font-medium text-gray-700 mb-1">
              Story Preferences (optional)
            </label>
            <textarea
              id="edit-preferences"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              rows="3"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="E.g., favorite themes, characters, or topics"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              type="submit"
            >
              Update Account
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Child Account"
      >
        <div className="p-6">
          <p className="mb-4 text-gray-700">
            Are you sure you want to delete {selectedChild?.name}'s account? This action cannot be undone.
          </p>
          <p className="mb-6 text-sm text-red-600">
            Note: This will not delete stories already created for this child.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button 
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
