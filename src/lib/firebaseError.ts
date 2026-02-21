const CODE_TO_MESSAGE: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/popup-closed-by-user': 'Google sign-in was canceled before completion.',
  'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
  'auth/unauthorized-domain': 'This app domain is not authorized for sign-in yet.',
}

export function getFirebaseErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback
  const maybeCode = (error as { code?: string }).code
  if (!maybeCode) return fallback
  return CODE_TO_MESSAGE[maybeCode] ?? fallback
}
