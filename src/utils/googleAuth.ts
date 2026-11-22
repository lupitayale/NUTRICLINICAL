import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import defaultFirebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
};

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_AUTHORIZED_DOMAINS_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;
export const OAUTH_CONSENT_URL = `https://console.cloud.google.com/apis/credentials/consent?project=${FIREBASE_PROJECT_ID}`;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to indicate if we are in the middle of a sign-in flow.
let isSigningIn = false;
// Cache the access token strictly in memory (never localStorage/sessionStorage).
let cachedAccessToken: string | null = null;

export interface GoogleAuthErrorInfo {
  code: string;
  message: string;
  isUnauthorizedDomain: boolean;
  isAccessDenied: boolean;
  hostname: string;
  projectId: string;
  consoleUrl: string;
  consentUrl: string;
}

export function getCurrentHostname(): string {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  return '';
}

export function parseGoogleAuthError(error: any): GoogleAuthErrorInfo {
  const code = String(error?.code || '');
  const rawMessage = String(error?.message || JSON.stringify(error));
  const rawLower = rawMessage.toLowerCase();
  const hostname = getCurrentHostname();

  const isUnauthorizedDomain =
    code === 'auth/unauthorized-domain' || rawLower.includes('unauthorized-domain');

  const isAccessDenied =
    code === 'auth/admin-restricted-operation' ||
    rawLower.includes('access_denied') ||
    rawLower.includes('access blocked') ||
    rawLower.includes('no ha completado el proceso de verificación') ||
    rawLower.includes('testers');

  let message = rawMessage;

  if (isAccessDenied) {
    message = `Acceso bloqueado (Error 403: access_denied): Tu cuenta de correo (ej. ln.alejandro.castro@gmail.com) aún no está agregada como Usuario de Prueba (Test User) en Google Cloud Console para el proyecto "${FIREBASE_PROJECT_ID}".`;
  } else if (isUnauthorizedDomain) {
    message = `Dominio no autorizado (${hostname || 'actual'}). Agrega "${
      hostname || 'este dominio'
    }" en Firebase Authentication → Configuración → Dominios autorizados del proyecto "${FIREBASE_PROJECT_ID}".`;
  } else if (code === 'auth/popup-blocked') {
    message =
      'Tu navegador bloqueó la ventana emergente de Google. Permite las ventanas emergentes para este sitio e intenta de nuevo.';
  } else if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request'
  ) {
    message =
      'Se cerró la ventana de Google antes de completar el inicio de sesión. Intenta nuevamente.';
  } else if (code === 'auth/operation-not-allowed') {
    message =
      'El inicio de sesión con Google no está habilitado en Firebase Authentication para este proyecto.';
  } else if (code === 'auth/network-request-failed') {
    message =
      'Error de red al conectar con los servidores de Google. Verifica tu conexión a internet.';
  }

  return {
    code,
    message,
    isUnauthorizedDomain,
    isAccessDenied,
    hostname,
    projectId: FIREBASE_PROJECT_ID,
    consoleUrl: FIREBASE_AUTHORIZED_DOMAINS_URL,
    consentUrl: OAUTH_CONSENT_URL,
  };
}

/**
 * Initialize auth state listener. Call this on app load.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Must be called from a button click or user interaction.
 * Authenticates the user with Google and grants Drive access token in memory.
 */
export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error(
        'No se obtuvo el token de acceso de Google Drive. Asegúrate de marcar la casilla de permiso de Google Drive al iniciar sesión.'
      );
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    const parsed = parseGoogleAuthError(error);
    const enrichedError: any = new Error(parsed.message);
    enrichedError.code = parsed.code;
    enrichedError.isUnauthorizedDomain = parsed.isUnauthorizedDomain;
    enrichedError.isAccessDenied = parsed.isAccessDenied;
    enrichedError.hostname = parsed.hostname;
    enrichedError.consoleUrl = parsed.consoleUrl;
    enrichedError.consentUrl = parsed.consentUrl;
    throw enrichedError;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

export const googleLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
