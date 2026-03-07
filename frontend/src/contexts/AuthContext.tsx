// Stub AuthContext
import { createContext, useContext } from 'react';

export const AuthContext = createContext<any>(null);

export const useAuth = () => {
  return useContext(AuthContext) || {};
};
