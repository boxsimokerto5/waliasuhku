import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDocFromServer, setLogLevel } from 'firebase/firestore';

// Silence Firestore logs to prevent connection warnings in restricted or offline test environments
setLogLevel('silent');

// Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyCrEuSB1OVS6Kzrc5xBJLjxqVlcNCXlH1Y",
  authDomain: "inlaid-park-8d2jw.firebaseapp.com",
  projectId: "inlaid-park-8d2jw",
  storageBucket: "inlaid-park-8d2jw.firebasestorage.app",
  messagingSenderId: "75023398519",
  appId: "1:75023398519:web:67144c8c030fa0967eb872"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID and long-polling forced to prevent WebSocket issues
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, "ai-studio-waliasuhku-5b4d6e99-725b-48c6-9756-310ee01109f2");

// Validate Connection to Firestore
async function testConnection() {
  try {
    // Attempt a direct fetch from server to verify connection health
    await getDocFromServer(doc(db, 'users', 'connection_test_doc'));
    console.log("Firestore connection healthy!");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('unavailable'))) {
      console.warn("Firestore is currently running offline. Please check your Firebase configuration or internet connection.");
    } else {
      console.info("Firestore initialized in offline/fallback mode:", error);
    }
  }
}
testConnection();

// Define operational enum for error logging context
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Global firestore error translator as requested by guidelines
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errStr = error instanceof Error ? error.message : String(error);
  const isQuotaError = 
    errStr.includes('Quota limit exceeded') || 
    errStr.includes('Quota exceeded') || 
    errStr.includes('RESOURCE_EXHAUSTED') ||
    errStr.toLowerCase().includes('quota');

  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };

  if (isQuotaError) {
    console.warn(`[Firestore Quota Exceeded] ${operationType} on ${path}: Database running in local offline fallback state.`);
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, db };
