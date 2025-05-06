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
    
    // Add the incident to Firestore
    const docRef = await addDoc(collection(db, INCIDENTS_COLLECTION), {
      ...incidentData,
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