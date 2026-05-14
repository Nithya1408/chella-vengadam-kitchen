import { createContext, useState, useContext, useEffect } from 'react';
import { signup as signupAPI, login as loginAPI, getCurrentUser } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if there's a saved token and try to load the user
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('cv_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getCurrentUser();
        setUser(res.user);
      } catch (err) {
        // Token invalid/expired — clear it
        console.warn('Auth token invalid, clearing it.');
        localStorage.removeItem('cv_token');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Sign up
  const signup = async (data) => {
    const res = await signupAPI(data);
    if (res.success) {
      localStorage.setItem('cv_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  // Login
  const login = async (data) => {
    const res = await loginAPI(data);
    if (res.success) {
      localStorage.setItem('cv_token', res.token);
      setUser(res.user);
    }
    return res;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('cv_token');
    setUser(null);
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        isAdmin,
        isStaff,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}