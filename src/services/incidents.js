import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// Collection references
const INCIDENTS_COLLECTION = 'incidents';
const WARNINGS_COLLECTION = 'warnings';

// Helper function to generate a filename for uploading
const generateFileName = (file) => {
  const timestamp = Date.now();
  return `${timestamp}_${file.name}`;
};

// Create a new incident report
export const createIncident = async (incidentData, photoFiles = []) => {
  try {
    // Upload photos if provided
    const photoUrls = [];
    
    if (photoFiles && photoFiles.length > 0) {
      for (const file of photoFiles) {
        const fileName = generateFileName(file);
        const storageRef = ref(storage, `incidents/${fileName}`);
        
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        photoUrls.push(downloadUrl);
      }
    }
    
    // Validate incident type
    if (!['regular', 'SOS'].includes(incidentData.type)) {
      throw new Error('Invalid incident type. Must be either "regular" or "SOS"');
    }
    
    // Add the incident to Firestore
    const docRef = await addDoc(collection(db, INCIDENTS_COLLECTION), {
      userId: incidentData.userId,
      type: incidentData.type,
      title: incidentData.title,
      description: incidentData.description,
      location: incidentData.location,
      pincode: incidentData.pincode,
      photos: photoUrls,
      timestamp: serverTimestamp(),
      isActive: true
    });
    
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating incident:', error);
    throw error;
  }
};

// Get all incidents
export const getAllIncidents = async () => {
  try {
    const q = query(
      collection(db, INCIDENTS_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }
};

// Get incidents by pincode
export const getIncidentsByPincode = async (pincode) => {
  try {
    const q = query(
      collection(db, INCIDENTS_COLLECTION),
      where('pincode', '==', pincode),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching incidents by pincode:', error);
    throw error;
  }
};

// Get SOS alerts
export const getSOSAlerts = async () => {
  try {
    const q = query(
      collection(db, INCIDENTS_COLLECTION),
      where('type', '==', 'SOS'),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching SOS alerts:', error);
    throw error;
  }
};

// Get a single incident by ID
export const getIncidentById = async (incidentId) => {
  try {
    const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log('No such incident!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching incident:', error);
    throw error;
  }
};

// Update an incident
export const updateIncident = async (incidentId, updatedData) => {
  try {
    const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });
    
    return { id: incidentId };
  } catch (error) {
    console.error('Error updating incident:', error);
    throw error;
  }
};

// Delete an incident
export const deleteIncident = async (incidentId) => {
  try {
    const docRef = doc(db, INCIDENTS_COLLECTION, incidentId);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};

// Create a new warning (admin only)
export const createWarning = async (warningData) => {
  try {
    // Validate severity
    if (!['low', 'medium', 'high'].includes(warningData.severity)) {
      throw new Error('Invalid severity level. Must be "low", "medium", or "high"');
    }
    
    // Validate affected pincodes
    if (!Array.isArray(warningData.affectedPincodes) || warningData.affectedPincodes.length === 0) {
      throw new Error('At least one affected pincode must be specified');
    }

    // Create a warning object with all expected fields
    const warning = {
      title: warningData.title,
      description: warningData.description,
      affectedPincodes: warningData.affectedPincodes,
      severity: warningData.severity,
      timestamp: serverTimestamp(),
      isActive: true,
      type: 'warning',
      resolvedAt: null,
      expiryTime: warningData.expiryTime || null,
      createdBy: warningData.createdBy || null,
      createdByName: warningData.createdByName || 'Admin'
    };
    
    const docRef = await addDoc(collection(db, WARNINGS_COLLECTION), warning);
    
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating warning:', error);
    throw error;
  }
};

// Get active warnings for a specific pincode
export const getWarningsForPincode = async (pincode) => {
  try {
    const q = query(
      collection(db, WARNINGS_COLLECTION),
      where('isActive', '==', true),
      where('affectedPincodes', 'array-contains', pincode),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching warnings:', error);
    throw error;
  }
};

// Get all active warnings
export const getAllActiveWarnings = async () => {
  try {
    const q = query(
      collection(db, WARNINGS_COLLECTION),
      where('isActive', '==', true),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all warnings:', error);
    throw error;
  }
};

// Resolve a warning
export const resolveWarning = async (warningId) => {
  try {
    const warningRef = doc(db, WARNINGS_COLLECTION, warningId);
    await updateDoc(warningRef, {
      isActive: false,
      resolvedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error resolving warning:', error);
    throw error;
  }
}; 