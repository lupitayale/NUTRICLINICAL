import defaultFirebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const CLIENT_ID =
  defaultFirebaseConfig.oAuthClientId ||
  '596937929677-m5s5ar8370rdvbar68kdet6hu7dfop9q.apps.googleusercontent.com';

export const FIREBASE_PROJECT_ID = defaultFirebaseConfig.projectId;
export const FIREBASE_AUTHORIZED_DOMAINS_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;
export const OAUTH_CONSENT_URL = `https://console.cloud.google.com/apis/credentials/consent?project=${FIREBASE_PROJECT_ID}`;

let cachedAccessToken: string | null = null;
let currentUser: {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
} | null = null;

let gsiLoaded = false;

export function getCurrentHostname(): string {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  return '';
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (
      gsiLoaded ||
      (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2)
    ) {
      gsiLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gsiLoaded = true;
      resolve();
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Initialize auth state listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (cachedAccessToken && currentUser) {
    if (onAuthSuccess) onAuthSuccess(currentUser, cachedAccessToken);
  } else {
    if (onAuthFailure) onAuthFailure();
  }
  return () => {};
};

/**
 * Authenticates user with Google Identity Services (GIS) Token Client.
 * Bypasses Firebase Auth domain restrictions completely so custom domains
 * like nutriclinical.onrender.com work instantly without unauthorized-domain errors.
 */
export const googleSignIn = async (): Promise<{
  user: any;
  accessToken: string;
} | null> => {
  await loadGsiScript();
  return new Promise((resolve, reject) => {
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES.join(' '),
        callback: async (response: any) => {
          if (response.error) {
            reject(
              new Error(
                `Error de autenticación Google (${response.error}): ${
                  response.error_description || 'No se pudo autorizar'
                }`
              )
            );
            return;
          }
          const accessToken = response.access_token;
          cachedAccessToken = accessToken;

          try {
            const userRes = await fetch(
              'https://www.googleapis.com/oauth2/v3/userinfo',
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const profile = await userRes.json();
            currentUser = {
              uid: profile.sub || profile.email || 'google-user',
              email: profile.email,
              displayName: profile.name || 'Lic. Alejandro Castro',
              photoURL: profile.picture,
            };
            resolve({ user: currentUser, accessToken });
          } catch {
            currentUser = {
              uid: 'google-user',
              displayName: 'Lic. Alejandro Castro',
            };
            resolve({ user: currentUser, accessToken });
          }
        },
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentFirebaseUser = () => {
  return currentUser;
};

export const googleLogout = async () => {
  cachedAccessToken = null;
  currentUser = null;
};
