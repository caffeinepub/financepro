/**
 * Utility functions for classifying Internet Computer replica rejection errors
 */

export type ReplicaErrorKind = 'canisterStopped' | 'generic';

export interface ReplicaErrorInfo {
  kind: ReplicaErrorKind;
  message: string;
  originalError: any;
}

/**
 * Detects if an error is a canister-stopped error (IC0508 / reject code 5)
 */
export function classifyReplicaError(error: any): ReplicaErrorInfo {
  const errorMessage = error?.message || String(error);
  
  // Check for IC0508 error code
  const hasIC0508 = errorMessage.includes('IC0508');
  
  // Check for reject code 5
  const hasRejectCode5 = errorMessage.includes('Reject code: 5');
  
  // Check for "is stopped" message
  const hasStoppedMessage = errorMessage.toLowerCase().includes('is stopped');
  
  // Check for "canister" and "stopped" in message
  const hasCanisterStopped = 
    errorMessage.toLowerCase().includes('canister') && 
    errorMessage.toLowerCase().includes('stopped');
  
  if (hasIC0508 || hasRejectCode5 || hasStoppedMessage || hasCanisterStopped) {
    return {
      kind: 'canisterStopped',
      message: 'The backend service is temporarily unavailable because the canister is stopped. Please try again later or contact support.',
      originalError: error,
    };
  }
  
  return {
    kind: 'generic',
    message: errorMessage || 'An unknown error occurred',
    originalError: error,
  };
}

/**
 * Check if an error is a canister-stopped error
 */
export function isCanisterStoppedError(error: any): boolean {
  return classifyReplicaError(error).kind === 'canisterStopped';
}
