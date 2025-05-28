import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from './firebaseConfig';

/**
 * Upload profile image to Firebase Storage
 * 
 * @param {string} userId - User ID
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadProfileImage = async (userId, file) => {
  try {
    // Create a reference to the file location
    const imageRef = ref(storage, `profile-images/${userId}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Delete profile image from Firebase Storage
 * 
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteProfileImage = async (userId) => {
  try {
    // Note: This is a simplified version. In production, you might want to:
    // 1. Store the image path in Firestore to know exactly which file to delete
    // 2. Or list all files in the user's profile-images folder and delete them
    
    // For now, we'll assume the photoURL contains the full path
    // You might need to adjust this based on your storage structure
    console.log('Delete profile image called for user:', userId);
    
    // Since we don't have the exact file path, we'll just resolve
    // In a real implementation, you'd store the file path in Firestore
    // and use that to delete the specific file
    return Promise.resolve();
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
};

/**
 * Upload child profile image
 * 
 * @param {string} childId - Child ID
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadChildProfileImage = async (childId, file) => {
  try {
    // Create a reference to the file location
    const imageRef = ref(storage, `child-profiles/${childId}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading child profile image:', error);
    throw error;
  }
};

/**
 * Delete child profile image
 * 
 * @param {string} childId - Child ID
 * @returns {Promise<void>}
 */
export const deleteChildProfileImage = async (childId) => {
  try {
    console.log('Delete child profile image called for child:', childId);
    
    // Similar to deleteProfileImage, this is simplified
    // In production, store the exact file path in Firestore
    return Promise.resolve();
  } catch (error) {
    console.error('Error deleting child profile image:', error);
    throw error;
  }
};

/**
 * Delete specific file by URL
 * 
 * @param {string} fileURL - Full URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFileByURL = async (fileURL) => {
  try {
    // Extract the file path from the URL
    const fileRef = ref(storage, fileURL);
    await deleteObject(fileRef);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Resize image before upload (optional utility)
 * 
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<Blob>} Resized image blob
 */
export const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};