/**
 * Utility to handle Firebase error messages and convert them to user-friendly messages
 */

/**
 * Get a user-friendly error message from a Firebase error code
 * @param {Error} error - The Firebase error object
 * @returns {string} A user-friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error || !error.code) {
    return "An unknown error occurred. Please try again.";
  }

  // Authentication errors
  switch (error.code) {
    // Auth errors
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return "Invalid email or password. Please try again.";
    case 'auth/email-already-in-use':
      return "This email is already in use. Please use another email.";
    case 'auth/weak-password':
      return "Password is too weak. Please use a stronger password.";
    case 'auth/invalid-email':
      return "Invalid email address. Please check your email format.";
    case 'auth/too-many-requests':
      return "Too many unsuccessful attempts. Please try again later.";
    case 'auth/network-request-failed':
      return "Network error. Please check your internet connection.";
    
    // Firestore errors
    case 'permission-denied':
      return "You don't have permission to perform this action.";
    case 'unavailable':
      return "The service is temporarily unavailable. Please try again later.";
    case 'not-found':
      return "The requested document was not found.";
    case 'cancelled':
      return "The operation was cancelled.";
    case 'invalid-argument':
      return "An invalid argument was provided to the operation.";
    case 'deadline-exceeded':
      return "The operation timed out. Please try again.";
    case 'resource-exhausted':
      return "The system is out of resources. Please try again later.";
    case 'failed-precondition':
      return "The operation failed because the system is not in the required state.";
    case 'aborted':
      return "The operation was aborted.";
    case 'out-of-range':
      return "The operation was attempted past the valid range.";
    case 'unimplemented':
      return "The operation is not implemented or not supported.";
    case 'internal':
      return "An internal error occurred. Please try again later.";
    case 'data-loss':
      return "Unrecoverable data loss or corruption.";
    case 'unauthenticated':
      return "You need to be logged in to perform this action.";
      
    default:
      return error.message || "An unexpected error occurred. Please try again.";
  }
};

/**
 * Logs Firebase errors in a consistent format for debugging
 * @param {Error} error - The Firebase error object
 * @param {string} context - Additional context for where the error occurred
 */
export const logFirebaseError = (error, context = '') => {
  console.error(`Firebase Error ${context ? `(${context})` : ''}:`, {
    code: error.code,
    message: error.message,
    stack: error.stack,
    details: error.details
  });
}; 