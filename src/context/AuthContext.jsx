import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext({ user: null, loading: false });

// Single source of truth for the Firebase auth session. Mounting one provider
// at the root avoids registering a separate onAuthStateChanged listener for
// every component that needs the current user.
export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: !!auth });

  useEffect(() => {
    if (!auth) {
      setState({ user: null, loading: false });
      return undefined;
    }

    return onAuthStateChanged(auth, (currentUser) => {
      setState({ user: currentUser, loading: false });
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
