import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { FaGamepad, FaCheck, FaTimes } from 'react-icons/fa';
import gsap from 'gsap';
import UserAvatar from './UserAvatar';

const GlobalMatchNotification = () => {
  const { socket, matchRequest, clearMatchRequest } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If we're on the Match page itself, let the MatchPage component handle its own UI
    if (location.pathname === '/match') {
      setIsVisible(false);
      return;
    }

    if (matchRequest) {
      setIsVisible(true);
      // Animation in
      setTimeout(() => {
        gsap.fromTo('.global-match-popup', 
          { y: 50, opacity: 0, scale: 0.9 }, 
          { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
        );
      }, 50);
    } else {
      setIsVisible(false);
    }
  }, [matchRequest, location.pathname]);

  const acceptRequest = () => {
    if (!socket || !matchRequest) return;
    
    // Close the popup here
    setIsVisible(false);
    
    // Jump to match page - MatchPage will pick up the matchRequest from SocketContext
    navigate('/match');
  };

  const declineRequest = () => {
    if (!socket || !matchRequest || !user) return;
    
    // Animate out
    gsap.to('.global-match-popup', { 
      y: 50, 
      opacity: 0, 
      scale: 0.9, 
      duration: 0.3, 
      ease: 'power2.in',
      onComplete: () => {
        socket.emit('match:decline', { 
          fromUserId: matchRequest.from._id || matchRequest.from.id,
          declinerId: user._id
        });
        clearMatchRequest();
        setIsVisible(false);
      }
    });
  };

  if (!isVisible || !matchRequest) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] global-match-popup shadow-2xl">
      <div className="bg-dark-900 border-2 border-primary-500 rounded-2xl p-5 w-80 relative overflow-hidden md:backdrop-blur-xl bg-opacity-90">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600"></div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>

        <div className="flex items-start gap-4 mb-4 relative z-10">
          <UserAvatar
            user={matchRequest.from}
            size="w-12 h-12"
            textSize="text-xl"
            className="shadow-lg shadow-primary-500/40 flex-shrink-0"
          />
          
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg mb-1 leading-tight">طلب مباراة تحدي!</h4>
            <p className="text-dark-300 text-sm leading-snug">
              اللاعب <span className="text-primary-400 font-bold">{matchRequest.from.fullName}</span> يتحداك في مستوى  
              <span className="text-amber-400 mr-1 font-bold">
                ({matchRequest.difficulty === 'easy' ? 'سهل' : matchRequest.difficulty === 'medium' ? 'متوسط' : 'صعب'})
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2 relative z-10">
          <button 
            onClick={acceptRequest}
            className="flex-1 bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            <FaCheck /> قبول والتحدي
          </button>
          <button 
            onClick={declineRequest}
            className="px-4 bg-dark-700 hover:bg-red-500 hover:text-white text-dark-300 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center transition-all shadow-lg"
            title="رفض"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalMatchNotification;
