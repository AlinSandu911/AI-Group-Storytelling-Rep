'use client';

import { useState, useRef } from 'react';
import { updateChildAccount } from '@/firebase/firestore';
import { uploadChildProfileImage, deleteChildProfileImage } from '@/firebase/storage';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import SuccessMessage from '@/components/common/SuccessMessage';

export default function ChildProfileManager({ child, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    name: child.name || '',
    age: child.age || '',
    interests: child.interests || '',
    photoURL: child.photoURL || '',
  });

  const [imageUpload, setImageUpload] = useState({
    file: null,
    preview: null,
    uploading: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUpload({ file, preview: reader.result, uploading: false });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageUpload.file) return;
    try {
      setImageUpload(prev => ({ ...prev, uploading: true }));
      setError(null);
      const photoURL = await uploadChildProfileImage(child.id, imageUpload.file);
      setFormData(prev => ({ ...prev, photoURL }));
      setImageUpload({ file: null, preview: null, uploading: false });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess(true);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setImageUpload(prev => ({ ...prev, uploading: false }));
    }
  };

  const handleImageRemove = async () => {
    try {
      setImageUpload(prev => ({ ...prev, uploading: true }));
      if (formData.photoURL) await deleteChildProfileImage(child.id);
      setFormData(prev => ({ ...prev, photoURL: '' }));
      setImageUpload({ file: null, preview: null, uploading: false });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccess(true);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image. Please try again.');
    } finally {
      setImageUpload(prev => ({ ...prev, uploading: false }));
    }
  };

  const cancelImageUpload = () => {
    setImageUpload({ file: null, preview: null, uploading: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      if (!formData.name.trim()) {
        setError('Child name is required.');
        setLoading(false);
        return;
      }
      await updateChildAccount(child.id, {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        interests: formData.interests.trim(),
        photoURL: formData.photoURL,
      });
      setSuccess(true);
      if (onUpdate) {
        onUpdate({
          ...child,
          name: formData.name.trim(),
          age: formData.age ? parseInt(formData.age) : null,
          interests: formData.interests.trim(),
          photoURL: formData.photoURL,
        });
      }
    } catch (err) {
      console.error('Error updating child profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Child Profile</h2>
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message="Profile updated successfully!" />}
    </div>
  );
}
