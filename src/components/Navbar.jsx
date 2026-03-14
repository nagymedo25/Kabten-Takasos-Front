import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaUserShield, FaSignOutAlt, FaUser, FaTrophy, FaClipboardList, FaHome, FaGamepad, FaBell } from 'react-icons/fa';
import gsap from 'gsap';
import UserAvatar from './UserAvatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { matchRequest } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const studentLinks = [
    { path: '/dashboard', label: 'الرئيسية', icon: <FaHome /> },
    { path: '/match', label: 'العب مباراة', icon: <FaGamepad /> },
    { path: '/leaderboard', label: 'المتصدرين', icon: <FaTrophy /> },
    { path: '/results', label: 'نتائجي', icon: <FaClipboardList /> },
    { path: '/profile', label: 'حسابي', icon: <FaUser /> },
  ];

  const adminLinks = [
    { path: '/admin', label: 'لوحة التحكم', icon: <FaUserShield /> },
    { path: '/admin/questions', label: 'الأسئلة', icon: <FaClipboardList /> },
    { path: '/admin/ai-import', label: 'استيراد AI', icon: <FaTrophy /> },
    { path: '/admin/matches', label: 'المباريات', icon: <FaGamepad /> },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-dark-700/50 md:backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/50 transition-shadow flex-shrink-0">
              <img src="/Logo.png" alt="كابتن تخصص" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">كابتن تخصص</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1 relative">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative
                  ${isActive(link.path)
                    ? 'bg-primary-500/20 text-primary-400 shadow-sm'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
                  }`}
              >
                {link.icon}
                {link.label}
                {/* Match Request Badge */}
                {link.path === '/match' && matchRequest && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[10px] text-white font-bold border border-dark-950">1</span>
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <UserAvatar
              user={user}
              size="w-8 h-8"
              textSize="text-xs"
              rounded="rounded-lg"
            />
            <span className="text-sm text-dark-400">
              مرحباً، <span className="text-primary-400 font-bold">{user?.fullName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-dark-400 hover:text-red-400 transition-colors text-sm"
            >
              <FaSignOutAlt />
              خروج
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-dark-300 hover:text-white transition-colors"
          >
            {isOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card border-t border-dark-700/50 animate-slideUp">
          <div className="px-4 py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive(link.path) ? 'bg-primary-500/20 text-primary-400' : 'text-dark-300 hover:text-white hover:bg-dark-700/50'}`}
              >
                <div className="flex items-center gap-3">
                  {link.icon}
                  {link.label}
                </div>
                {link.path === '/match' && matchRequest && (
                  <span className="flex h-5 w-5 bg-red-500 rounded-full items-center justify-center text-xs text-white font-bold shadow-lg shadow-red-500/30 animate-pulse">
                    1
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FaSignOutAlt />
              تسجيل الخروج
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
