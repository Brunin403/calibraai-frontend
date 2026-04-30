import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ao iniciar, verifica se já existe token salvo e busca dados do usuário
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Opcional: buscar perfil do usuário no backend
      // api.get('/auth/profile').then(res => setUser(res.data)).catch(() => logout());
      setUser({ token }); // simplificado: apenas guarda o token
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    setUser({ ...userData, token });
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);