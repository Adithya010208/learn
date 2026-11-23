import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export function getAdminAuth() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    initializeApp({
      projectId: firebaseConfig.projectId,
      ...(raw ? { credential: cert(JSON.parse(raw)) } : {}),
    });
  }
  return getAuth();
}
