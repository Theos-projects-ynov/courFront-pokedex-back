import { useState, useEffect } from 'react';
import { AuthService } from '../service/authService';
import type { Trainer } from '../types/Trainer';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Trainer | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      if (AuthService.isLoggedIn()) {
        try {
          const trainerData = await AuthService.getTrainerProfile();
          setUser(trainerData);
          setIsAuthenticated(true);
        } catch {
          // Token invalide ou expiré
          await AuthService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await AuthService.login({ email, password });
    setUser(result.trainer);
    setIsAuthenticated(true);
    return result;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };
}; 