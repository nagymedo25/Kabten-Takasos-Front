import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [matchRequest, setMatchRequest] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && user._id && user.role !== 'admin') {
      // Connect directly to the backend
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
        newSocket.emit('user:online', user._id);
      });

      newSocket.on('reconnect', () => {
        console.log('🔄 Socket reconnected');
        newSocket.emit('user:online', user._id);
      });

      newSocket.on('connect_error', (err) => {
        console.log('⚠️ Socket connection error:', err.message);
      });

      newSocket.on('match:onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('match:requestReceived', (data) => {
        setMatchRequest(data);
      });

      newSocket.on('match:declined', () => {
        setMatchRequest(null);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
      };
    } else {
      // Cleanup if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [user]);

  const clearMatchRequest = () => setMatchRequest(null);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, matchRequest, clearMatchRequest }}>
      {children}
    </SocketContext.Provider>
  );
};
