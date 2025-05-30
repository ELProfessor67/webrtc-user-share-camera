"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadMeRequest } from '@/http/authHttp';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    try {
      setLoading(true);
      const response = await loadMeRequest()
      
      if (response.data) {
        setUser(response.data.user);
        setIsAuth(true);
      } else {
        setUser(null);
        setIsAuth(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const value = {
    isAuth,
    user,
    loading,
    loadMe,
    setIsAuth,
    setUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};



