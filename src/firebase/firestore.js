import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    setDoc, 
    orderBy, 
    limit,
    serverTimestamp
      
} from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Get all stories for a specific user
 * 
 * @param {string} userId - User ID to fetch stories for
 * @returns {Promise<Array>} Array of story objects
 */
export const getStoriesByUserId = async (userId) => {
    try {
        const storiesRef = collection(db, 'stories');
        const q = query(
            storiesRef, 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting stories:', error);
        throw error;
    }
};

/**
 * Get all stories for a specific family (for child view)
 * 
 * @param {string} familyId - Family ID to fetch stories for
 * @returns {Promise<Array>} Array of story objects
 */
export const getStoriesByFamilyId = async (familyId) => {
    try {
        const storiesRef = collection(db, 'stories');
        const q = query(
            storiesRef, 
            where('familyId', '==', familyId),
            where('isPublished', '==', true),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting family stories:', error);
        throw error;
    }
};

/**
 * Get a specific story by ID
 * 
 * @param {string} storyId - Story ID to fetch
 * @returns {Promise<Object|null>} Story object or null if not found
 */
export const getStoryById = async (storyId) => {
    try {
        const storyDoc = await getDoc(doc(db, 'stories', storyId));
        
        if (storyDoc.exists()) {
            return {
                id: storyDoc.id,
                ...storyDoc.data()
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting story:', error);
        throw error;
    }
};

/**
 * Create a new story
 * 
 * @param {Object} storyData - Story data to save
 * @returns {Promise<Object>} Created story object with ID
 */
export const createStory = async (storyData) => {
    try {
        // Add server timestamp for created and updated dates
        const storyWithTimestamps = {
            ...storyData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'stories'), storyWithTimestamps);
        
        return {
            id: docRef.id,
            ...storyWithTimestamps
        };
    } catch (error) {
        console.error('Error creating story:', error);
        throw error;
    }
};

/**
 * Update an existing story
 * 
 * @param {string} storyId - ID of story to update
 * @param {Object} storyData - Updated story data
 * @returns {Promise<void>}
 */
export const updateStory = async (storyId, storyData) => {
    try {
        // Add server timestamp for updated date
        const updateData = {
            ...storyData,
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(doc(db, 'stories', storyId), updateData);
    } catch (error) {
        console.error('Error updating story:', error);
        throw error;
    }
};

/**
 * Delete a story
 * 
 * @param {string} storyId - ID of story to delete
 * @returns {Promise<void>}
 */
export const deleteStory = async (storyId) => {
    try {
        await deleteDoc(doc(db, 'stories', storyId));
    } catch (error) {
        console.error('Error deleting story:', error);
        throw error;
    }
};

/**
 * Toggle favorite status of a story
 * 
 * @param {string} storyId - ID of story to update
 * @param {boolean} isFavorite - New favorite status
 * @returns {Promise<void>}
 */
export const toggleStoryFavorite = async (storyId, isFavorite) => {
    try {
        await updateDoc(doc(db, 'stories', storyId), { 
            isFavorite, 
            updatedAt: serverTimestamp() 
        });
    } catch (error) {
        console.error('Error updating story favorite status:', error);
        throw error;
    }
};

/**
 * Get favorite stories for a user
 * 
 * @param {string} userId - User ID to fetch stories for
 * @param {number} [limitCount=10] - Maximum number of stories to fetch
 * @returns {Promise<Array>} Array of favorite story objects
 */
export const getFavoriteStories = async (userId, limitCount = 10) => {
    try {
        const storiesRef = collection(db, 'stories');
        const q = query(
            storiesRef, 
            where('userId', '==', userId),
            where('isFavorite', '==', true),
            orderBy('updatedAt', 'desc'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting favorite stories:', error);
        throw error;
    }
};

/**
 * Send a contact message to Firestore
 * 
 * @param {Object} messageData - Contact message data
 * @returns {Promise<string>} ID of the created message document
 */
export const sendContactMessage = async (messageData) => {
    try {
        const docRef = await addDoc(collection(db, 'contactMessages'), {
            ...messageData,
            createdAt: serverTimestamp(),
            status: 'new'
        });
        
        return docRef.id;
    } catch (error) {
        console.error('Error sending contact message:', error);
        throw error;
    }
};

/**
 * Get user profile data
 * 
 * @param {string} userId - User ID to fetch profile for
 * @returns {Promise<Object|null>} User profile object or null if not found
 */
export const getUserProfile = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
        return {
            id: userDoc.id,
            ...userDoc.data()
        };
        } else {
        return null;
        }
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
};

/**
 * Update user profile data
 * 
 * @param {string} userId - User ID to update profile for
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userId, profileData) => {
    try {
        await updateDoc(doc(db, 'users', userId), {
            ...profileData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Search stories by title for a specific user
 * 
 * @param {string} userId - User ID to search stories for
 * @param {string} searchTerm - Search term to match in titles
 * @returns {Promise<Array>} Array of matching story objects
 */
export const searchStoriesByTitle = async (userId, searchTerm) => {
    try {
        // Note: Firestore doesn't support native text search
        // This is a simple implementation that fetches all user stories and filters client-side
        // For a production app, consider using Algolia or another search service
        
        const storiesRef = collection(db, 'stories');
        const q = query(
            storiesRef, 
            where('userId', '==', userId),
            orderBy('title')
        );
        
        const querySnapshot = await getDocs(q);
        const allStories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Filter stories by title (case-insensitive)
        const searchTermLower = searchTerm.toLowerCase();
        return allStories.filter(story => 
            story.title.toLowerCase().includes(searchTermLower)
        );
    } catch (error) {
        console.error('Error searching stories:', error);
        throw error;
    }
};

/**
 * Get draft stories for a user
 * 
 * @param {string} userId - User ID to fetch stories for
 * @returns {Promise<Array>} Array of draft story objects
 */
export const getDraftStories = async (userId) => {
    try {
        const storiesRef = collection(db, 'stories');
        const q = query(
            storiesRef, 
            where('userId', '==', userId),
            where('isPublished', '==', false),
            orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting draft stories:', error);
        throw error;
    }
};

/**
 * Get published stories for a user
 * 
 * @param {string} userId - User ID to fetch stories for
 * @returns {Promise<Array>} Array of published story objects
 */
export const getPublishedStories = async (userId) => {
    try {
        const storiesRef = collection(db, 'stories');
        const q = query(
            storiesRef, 
            where('userId', '==', userId),
            where('isPublished', '==', true),
            orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting published stories:', error);
        throw error;
    }
};

/**
 * 
 * @param {string} userId - User ID to fetch stories for
 * @param {number} [limitCount=5] - Maximum number of stories to fetch
 * @returns {Promise<Array>} Array of recent story objects
 */
export const getRecentStories = async (userId, limitCount = 5) => {
    try {
        const storiesRef = collection(db, 'stories');
        const q = query(
            storiesRef, 
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting recent stories:', error);
        throw error;
    }
};

/**
 * Publish or unpublish a story
 * 
 * @param {string} storyId - ID of story to update
 * @param {boolean} isPublished - New published status
 * @returns {Promise<void>}
 */
export const setStoryPublishStatus = async (storyId, isPublished) => {
    try {
        await updateDoc(doc(db, 'stories', storyId), { 
            isPublished, 
            updatedAt: serverTimestamp() 
        });
    } catch (error) {
        console.error('Error updating story publish status:', error);
        throw error;
    }
};

/**
 * Get audio document for a specific story
 * @param {string} storyId - The story ID to find the audio for
 * @returns {Promise<Object|null>} Audio data or null
 */
export const getStoryWithAudioById = async (storyId) => {
  try {
    // 1. Primeiro buscamos os dados da história
    const storyDoc = await getDoc(doc(db, "stories", storyId));
    if (!storyDoc.exists()) {
      console.log("História não encontrada:", storyId);
      return null;
    }

    const storyData = { id: storyDoc.id, ...storyDoc.data() };
    
    // 2. Verificamos se a história já tem audioUrl diretamente no documento
    if (storyData.audioUrl) {
      console.log("AudioUrl encontrado na história:", storyData.audioUrl);
      return storyData;
    }

    console.log("AudioUrl não encontrado na história, buscando na coleção audios...");

    // 3. Se não tem, buscamos na coleção 'audios'
    const q = query(collection(db, "audios"), where("storyId", "==", storyId));
    const audioSnapshot = await getDocs(q);

    if (!audioSnapshot.empty) {
      const audioData = audioSnapshot.docs[0].data();
      console.log("Áudio encontrado na coleção:", audioData);
      
      storyData.audioUrl = audioData.audioUrl;
      storyData.audioDuration = audioData.duration;
      
      // 4. Atualizamos o documento da história para incluir o audioUrl
      try {
        await updateDoc(doc(db, "stories", storyId), {
          audioUrl: audioData.audioUrl,
          updatedAt: serverTimestamp()
        });
        console.log("História atualizada com audioUrl");
      } catch (updateErr) {
        console.warn("Não foi possível atualizar a história com a URL do áudio:", updateErr);
      }
    } else {
      console.log("Nenhum áudio encontrado para esta história");
      storyData.audioUrl = null;
    }

    return storyData;
  } catch (err) {
    console.error("Erro ao buscar história com áudio:", err.message || err);
    // Retorna a história sem áudio em caso de erro
    try {
      const storyDoc = await getDoc(doc(db, "stories", storyId));
      if (storyDoc.exists()) {
        return { id: storyDoc.id, ...storyDoc.data(), audioUrl: null };
      }
    } catch (fallbackErr) {
      console.error("Erro no fallback:", fallbackErr);
    }
    throw err;
  }
};

/**
 * Get all child accounts for a family
 * 
 * @param {string} familyId - The family ID
 * @returns {Promise<Array>} - Array of child accounts
 */
export async function getChildAccounts(familyId) {
  try {
    const childrenRef = collection(db, 'users');
    const q = query(
      childrenRef,
      where('familyId', '==', familyId),
      where('role', '==', 'child')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting child accounts:', error);
    throw error;
  }
}

/**
 * Create a new child account
 * 
 * @param {Object} childData - Child account data
 * @returns {Promise<Object>} - Created child account
 */
export async function createChildAccount(childData) {
  try {
    // Generate a unique ID for the child account
    const childRef = doc(collection(db, 'users'));
    
    // Create the child account data
    const childAccount = {
      ...childData,
      id: childRef.id,
      role: 'child',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Save to Firestore
    await setDoc(childRef, childAccount);
    
    return {
      id: childRef.id,
      ...childAccount
    };
  } catch (error) {
    console.error('Error creating child account:', error);
    throw error;
  }
}

/**
 * Update a child account
 * 
 * @param {string} childId - Child account ID
 * @param {Object} childData - Updated child account data
 * @returns {Promise<void>}
 */
export async function updateChildAccount(childId, childData) {
  try {
    const childRef = doc(db, 'users', childId);
    
    await updateDoc(childRef, {
      ...childData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating child account:', error);
    throw error;
  }
}

/**
 * Delete a child account
 * 
 * @param {string} childId - Child account ID
 * @returns {Promise<void>}
 */
export async function deleteChildAccount(childId) {
  try {
    const childRef = doc(db, 'users', childId);
    
    await deleteDoc(childRef);
  } catch (error) {
    console.error('Error deleting child account:', error);
    throw error;
  }
}

/**
 * Creates a story and associates it with a specific child if provided
 * 
 * @param {Object} storyData - Story data
 * @param {string} childId - Optional child ID to associate with the story
 * @returns {Promise<Object>} Created story
 */
export async function createStoryForChild(storyData, childId = null) {
  try {
    // Generate a unique ID for the story
    const storyRef = doc(collection(db, 'stories'));
    
    // Add childId to the story data if provided
    const finalStoryData = {
      ...storyData,
      ...(childId && { childId }),
      id: storyRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Save to Firestore
    await setDoc(storyRef, finalStoryData);
    
    return {
      id: storyRef.id,
      ...finalStoryData
    };
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
}

/**
 * Get stories by child ID - VERSÃO SIMPLIFICADA (sem índices compostos)
 * 
 * @param {string} childId - Child account ID
 * @returns {Promise<Array>} - Array of stories
 */
export async function getStoriesByChildId(childId) {
  try {
    console.log('🔍 getStoriesByChildId called with:', childId);
    
    // Buscar perfil da criança para obter familyId
    const childProfile = await getUserProfile(childId);
    console.log('👶 Child profile:', childProfile);
    
    if (!childProfile) {
      console.warn('❌ Child profile not found for ID:', childId);
      return [];
    }
    
    const familyId = childProfile.familyId;
    console.log('👨‍👩‍👧‍👦 Family ID:', familyId);
    
    const storiesRef = collection(db, 'stories');
    
    // 🔍 QUERY 1: Histórias por childId (sem orderBy para evitar índice)
    const directQuery = query(
      storiesRef,
      where('childId', '==', childId),
      where('isPublished', '==', true)
    );
    
    // 🔍 QUERY 2: Histórias da família (sem orderBy para evitar índice)
    const familyQuery = query(
      storiesRef,
      where('familyId', '==', familyId),
      where('isPublished', '==', true)
    );
    
    console.log('🔍 Executing simplified queries...');
    
    const [directSnapshot, familySnapshot] = await Promise.all([
      getDocs(directQuery),
      getDocs(familyQuery)
    ]);
    
    console.log('📊 Direct stories found:', directSnapshot.size);
    console.log('📊 Family stories found:', familySnapshot.size);
    
    // Combinar e remover duplicatas
    const allStories = new Map();
    
    // Adicionar histórias diretas
    directSnapshot.docs.forEach(doc => {
      const story = { id: doc.id, ...doc.data(), source: 'direct' };
      allStories.set(doc.id, story);
      console.log('📖 Direct story:', story.title);
    });
    
    // Adicionar histórias da família
    familySnapshot.docs.forEach(doc => {
      if (!allStories.has(doc.id)) {
        const story = { id: doc.id, ...doc.data(), source: 'family' };
        allStories.set(doc.id, story);
        console.log('📖 Family story:', story.title);
      }
    });
    
    // Converter para array e ordenar por data (lado cliente)
    const result = Array.from(allStories.values())
      .filter(story => story.isPublished === true) // Filtro extra de segurança
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA; // Mais recente primeiro
      });
    
    console.log('📚 Total unique stories:', result.length);
    console.log('📚 Final stories:', result.map(s => ({ 
      id: s.id, 
      title: s.title, 
      source: s.source,
      isPublished: s.isPublished 
    })));
    
    return result;
    
  } catch (error) {
    console.error('❌ Error in getStoriesByChildId:', error);
    
    // 🔄 FALLBACK: Busca mais simples ainda
    try {
      console.log('🔄 Trying simplest fallback query...');
      
      const storiesRef = collection(db, 'stories');
      const fallbackQuery = query(
        storiesRef,
        where('childId', '==', childId)
      );
      
      const snapshot = await getDocs(fallbackQuery);
      const fallbackResult = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'fallback'
        }))
        .filter(story => story.isPublished === true) // Filtrar só publicadas
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });
      
      console.log('🔄 Fallback found:', fallbackResult.length, 'published stories');
      return fallbackResult;
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
      throw error;
    }
  }
}