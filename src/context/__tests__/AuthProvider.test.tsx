import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../AuthProvider';
import { AuthContext } from '../AuthContext';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  deleteUser
} from 'firebase/auth';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ReferralService } from '../../features/growth/services/referralService';
import React from 'react';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(() => Promise.resolve()),
  sendEmailVerification: vi.fn(() => Promise.resolve()),
  verifyBeforeUpdateEmail: vi.fn(() => Promise.resolve()),
  deleteUser: vi.fn(() => Promise.resolve()),
  GoogleAuthProvider: vi.fn(),
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

// Mock our internal firebase lib
vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: null },
  googleProvider: {},
  db: {},
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
}));

// Mock ReferralService
vi.mock('../../features/growth/services/referralService', () => ({
  ReferralService: {
    ensureReferralCode: vi.fn(() => Promise.resolve()),
    getUserByReferralCode: vi.fn(() => Promise.resolve(null)),
  }
}));

describe('AuthProvider', () => {
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User',
    getIdTokenResult: vi.fn(() => Promise.resolve({ claims: {} })),
    getIdToken: vi.fn(() => Promise.resolve('mock-token')),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for onAuthStateChanged
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return () => {};
    });
  });

  it('renders children and starts in loading state', () => {
    // Override the default mock to stay in loading state
    (onAuthStateChanged as any).mockImplementation((_auth: any, _callback: any) => {
      // Don't call the callback immediately
      return () => {};
    });

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    expect(capturedContext.loading).toBe(true);
  });

  it('updates state when user logs in', async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'seeker', referralCode: 'REF123' })
    } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(capturedContext.loading).toBe(false);
      expect(capturedContext.user).toEqual(mockUser);
      expect(capturedContext.userData.role).toBe('seeker');
    });
  });

  it('handles sign up correctly', async () => {
    const mockUserCredential = { user: mockUser };
    const { createUserWithEmailAndPassword: signupMock } = await import('../../lib/firebase');
    vi.mocked(signupMock).mockResolvedValue(mockUserCredential as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await capturedContext.signupWithEmail('test@example.com', 'password', 'New User');
    });

    expect(signupMock).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password');
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      displayName: 'New User'
    }), expect.anything());
  });

  it('handles logout correctly', async () => {
    const { signOut: logoutMock } = await import('../../lib/firebase');
    vi.mocked(logoutMock).mockResolvedValue(undefined as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await capturedContext.logout();
    });

    expect(logoutMock).toHaveBeenCalled();
  });

  it('handles login errors gracefully', async () => {
    const { signInWithEmailAndPassword: loginMock } = await import('../../lib/firebase');
    vi.mocked(loginMock).mockRejectedValue({ code: 'auth/wrong-password' } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try {
        await capturedContext.loginWithEmail('test@example.com', 'wrong');
      } catch (e) {
        // Expected
      }
    });

    expect(capturedContext.error).toBe('Incorrect password. Please try again.');
  });

  it('handles login with Google correctly', async () => {
    const { signInWithPopup: googleLoginMock } = await import('firebase/auth');
    vi.mocked(googleLoginMock).mockResolvedValue({ user: mockUser } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await capturedContext.loginWithGoogle();
    });

    expect(googleLoginMock).toHaveBeenCalled();
  });

  it('handles password reset correctly', async () => {
    const { sendPasswordResetEmail: resetMock } = await import('../../lib/firebase');
    vi.mocked(resetMock).mockResolvedValue(undefined as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await capturedContext.resetPassword('test@example.com');
    });

    expect(resetMock).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
  });

  it('handles user data refresh', async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'seeker', referralCode: 'REF123', displayName: 'Refreshed' })
    } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      await capturedContext.refreshUserData();
    });

    expect(getDoc).toHaveBeenCalled();
    expect(capturedContext.userData.displayName).toBe('Refreshed');
  });

  it('handles onboarding completion', async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      await capturedContext.completeOnboarding({ phone: '1234567890' });
    });

    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      onboarding_complete: true,
      phone: '1234567890'
    }));
  });

  it('handles display name update', async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      await capturedContext.updateDisplayName('New Name');
    });

    expect(setDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      displayName: 'New Name'
    }), expect.anything());
  });

  it('handles account deletion', async () => {
    const { deleteUser: deleteMock } = await import('firebase/auth');
    vi.mocked(deleteMock).mockResolvedValue(undefined as any);
    
    // Set current user in mock firebase lib
    const firebaseLib = await import('../../lib/firebase');
    (firebaseLib.auth as any).currentUser = mockUser;

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await capturedContext.deleteAccount();
    });

    expect(deleteMock).toHaveBeenCalledWith(mockUser);
  });

  it('handles verification email', async () => {
    const { sendEmailVerification: verifyMock } = await import('../../lib/firebase');
    vi.mocked(verifyMock).mockResolvedValue(undefined as any);

    // Set current user
    const firebaseLib = await import('../../lib/firebase');
    (firebaseLib.auth as any).currentUser = mockUser;

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            capturedContext = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await capturedContext.sendVerificationEmail();
    });

    expect(verifyMock).toHaveBeenCalledWith(mockUser);
  });

  it('throws when sendVerificationEmail called with no current user', async () => {
    const firebaseLib = await import('../../lib/firebase');
    (firebaseLib.auth as any).currentUser = null;

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try {
        await capturedContext.sendVerificationEmail();
      } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('You must be signed in to verify your email.');
  });

  it('handles verifyEmailUpdate correctly', async () => {
    const { verifyBeforeUpdateEmail } = await import('firebase/auth');
    vi.mocked(verifyBeforeUpdateEmail).mockResolvedValue(undefined);

    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'seeker' })
    } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      await capturedContext.verifyEmailUpdate('new@example.com');
    });

    expect(verifyBeforeUpdateEmail).toHaveBeenCalledWith(mockUser, 'new@example.com');
  });

  it('sets error on verifyEmailUpdate auth/requires-recent-login', async () => {
    const { verifyBeforeUpdateEmail } = await import('firebase/auth');
    vi.mocked(verifyBeforeUpdateEmail).mockRejectedValue({ code: 'auth/requires-recent-login' });

    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'seeker' })
    } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      try {
        await capturedContext.verifyEmailUpdate('new@example.com');
      } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('For security, please sign out and sign back in before changing your email.');
  });

  it('sets error on verifyEmailUpdate auth/email-already-in-use', async () => {
    const { verifyBeforeUpdateEmail } = await import('firebase/auth');
    vi.mocked(verifyBeforeUpdateEmail).mockRejectedValue({ code: 'auth/email-already-in-use' });

    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'seeker' })
    } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      try {
        await capturedContext.verifyEmailUpdate('other@example.com');
      } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('This email is already associated with another account.');
  });

  it('clearError resets error to null', async () => {
    const { signInWithEmailAndPassword: loginMock } = await import('../../lib/firebase');
    vi.mocked(loginMock).mockRejectedValue({ code: 'auth/wrong-password' } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try { await capturedContext.loginWithEmail('x@x.com', 'wrong'); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBeTruthy();

    await act(async () => {
      capturedContext.clearError();
    });

    expect(capturedContext.error).toBeNull();
  });

  it('handles loginWithEmail user-not-found error', async () => {
    const { signInWithEmailAndPassword: loginMock } = await import('../../lib/firebase');
    vi.mocked(loginMock).mockRejectedValue({ code: 'auth/user-not-found' } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try { await capturedContext.loginWithEmail('x@x.com', 'pass'); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('No account found with this email address.');
  });

  it('handles loginWithEmail invalid-credential error', async () => {
    const { signInWithEmailAndPassword: loginMock } = await import('../../lib/firebase');
    vi.mocked(loginMock).mockRejectedValue({ code: 'auth/invalid-credential' } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try { await capturedContext.loginWithEmail('x@x.com', 'pass'); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('Invalid email or password.');
  });

  it('handles loginWithGoogle with referral code', async () => {
    const { signInWithPopup: googleLoginMock } = await import('firebase/auth');
    vi.mocked(googleLoginMock).mockResolvedValue({ user: mockUser } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      await capturedContext.loginWithGoogle('REF123');
    });

    expect(sessionStorage.getItem('pendingReferralCode')).toBe('REF123');
    expect(googleLoginMock).toHaveBeenCalled();
  });

  it('handles signupWithEmail with operation-not-allowed error', async () => {
    const { createUserWithEmailAndPassword: signupMock } = await import('../../lib/firebase');
    vi.mocked(signupMock).mockRejectedValue({ code: 'auth/operation-not-allowed' } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try { await capturedContext.signupWithEmail('x@x.com', 'pass', 'Name'); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe("Email/Password sign-in is not enabled in the Firebase Console. Please enable it.");
  });

  it('creates new user doc when user doc does not exist', async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      data: () => undefined
    } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    // The setDoc call should create the user doc
    expect(setDoc).toHaveBeenCalled();
  });

  it('handles refreshUserData error gracefully', async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    vi.mocked(getDoc)
      .mockResolvedValueOnce({ exists: () => true, data: () => ({ role: 'seeker' }) } as any)
      .mockRejectedValueOnce(new Error('Firestore error'));

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      try { await capturedContext.refreshUserData(); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBeTruthy();
  });

  it('sets generic error on verifyEmailUpdate with unknown error code', async () => {
    const { verifyBeforeUpdateEmail } = await import('firebase/auth');
    vi.mocked(verifyBeforeUpdateEmail).mockRejectedValue({ code: 'auth/unknown', message: 'Some unexpected error' });

    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'seeker' })
    } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    await act(async () => {
      try { await capturedContext.verifyEmailUpdate('x@x.com'); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('Some unexpected error');
  });

  it('sets error on deleteAccount with auth/requires-recent-login', async () => {
    const { deleteUser: deleteMock } = await import('firebase/auth');
    vi.mocked(deleteMock).mockRejectedValue({ code: 'auth/requires-recent-login' });

    const firebaseLib = await import('../../lib/firebase');
    (firebaseLib.auth as any).currentUser = mockUser;

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try { await capturedContext.deleteAccount(); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('For security, please sign out and sign back in before deleting your account.');
  });

  it('sets generic error on deleteAccount with unknown error', async () => {
    const { deleteUser: deleteMock } = await import('firebase/auth');
    vi.mocked(deleteMock).mockRejectedValue({ code: 'unknown', message: 'Delete failed unexpectedly' });

    const firebaseLib = await import('../../lib/firebase');
    (firebaseLib.auth as any).currentUser = mockUser;

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await act(async () => {
      try { await capturedContext.deleteAccount(); } catch { /* expected */ }
    });

    expect(capturedContext.error).toBe('Delete failed unexpectedly');
  });

  it('creates new user with pending referral code from sessionStorage', async () => {
    sessionStorage.setItem('pendingReferralCode', 'REFCODE');

    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => false,
      data: () => undefined
    } as any);

    vi.mocked(ReferralService.getUserByReferralCode).mockResolvedValue('referrer-uid' as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    expect(ReferralService.getUserByReferralCode).toHaveBeenCalledWith('REFCODE');
    expect(sessionStorage.getItem('pendingReferralCode')).toBeNull();
  });

  it('handles existing user without referral code (generates one)', async () => {
    (onAuthStateChanged as any).mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    vi.mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'seeker', referralCode: null })  // No referralCode
      } as any)
      .mockResolvedValue({
        exists: () => true,
        data: () => ({ role: 'seeker', referralCode: 'NEW_CODE' })
      } as any);

    let capturedContext: any;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => { capturedContext = value; return null; }}
        </AuthContext.Consumer>
      </AuthProvider>
    );

    await waitFor(() => expect(capturedContext.loading).toBe(false));

    expect(ReferralService.ensureReferralCode).toHaveBeenCalledWith(mockUser.uid);
  });
});
