import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database (supports default or custom database)
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: client appears offline or checking connection.');
    }
    return false;
  }
}

// Auth helper functions
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Popup Error:', error);
    throw error;
  }
}

export async function signInWithGoogleRedirect() {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google Sign-In Redirect Error:', error);
    throw error;
  }
}

export async function checkRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.error('Google Redirect Result Error:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error('Sign In Email Error:', error);
    throw error;
  }
}

export async function signUpWithEmail(email: string, pass: string, displayName?: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error) {
    console.error('Sign Up Email Error:', error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

export interface FormattedAuthError {
  message: string;
  code: string;
  isUnauthorizedDomain: boolean;
  isPopupBlocked: boolean;
}

export function formatAuthErrorMessage(error: unknown): FormattedAuthError {
  const code = (error && typeof error === 'object' && 'code' in error)
    ? String((error as { code: unknown }).code)
    : '';
  const rawMsg = error instanceof Error ? error.message : String(error);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  if (code === 'auth/unauthorized-domain' || rawMsg.includes('unauthorized-domain')) {
    return {
      code: 'auth/unauthorized-domain',
      message: `โดเมน "${currentHost}" ยังไม่ได้รับอนุญาตใน Firebase Authentication`,
      isUnauthorizedDomain: true,
      isPopupBlocked: false,
    };
  }

  if (code === 'auth/popup-blocked' || rawMsg.includes('popup-blocked')) {
    return {
      code: 'auth/popup-blocked',
      message: 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตหน้าต่างป๊อปอัป หรือกดปุ่มเข้าสู่ระบบแบบ Redirect',
      isUnauthorizedDomain: false,
      isPopupBlocked: true,
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      code,
      message: 'หน้าต่างเข้าสู่ระบบถูกปิดก่อนทำรายการเสร็จสิ้น กรุณาลองใหม่อีกครั้ง',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
    };
  }

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return {
      code,
      message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
    };
  }

  if (code === 'auth/user-not-found') {
    return {
      code,
      message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาเลือกแท็บ "สมัครสมาชิก"',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
    };
  }

  if (code === 'auth/email-already-in-use') {
    return {
      code,
      message: 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านได้ทันที',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
    };
  }

  if (code === 'auth/weak-password') {
    return {
      code,
      message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
    };
  }

  if (code === 'auth/invalid-email') {
    return {
      code,
      message: 'รูปแบบอีเมลไม่ถูกต้อง กรุณาระบุ เช่น yourname@gmail.com',
      isUnauthorizedDomain: false,
      isPopupBlocked: false,
    };
  }

  return {
    code,
    message: rawMsg || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง',
    isUnauthorizedDomain: false,
    isPopupBlocked: false,
  };
}

