import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('kabten_user');
    const token = localStorage.getItem('kabten_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await API.post('/auth/login', { username, password });
    localStorage.setItem('kabten_token', data.token);
    localStorage.setItem('kabten_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    localStorage.setItem('kabten_token', data.token);
    localStorage.setItem('kabten_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('kabten_token');
    localStorage.removeItem('kabten_user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem('kabten_user', JSON.stringify(newUser));
    setUser(newUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
