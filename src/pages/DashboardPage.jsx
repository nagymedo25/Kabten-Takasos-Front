import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import gsap from 'gsap';
import { FaPlay, FaTrophy, FaClipboardList, FaUser, FaCode, FaNetworkWired, FaSatelliteDish, FaGamepad, FaStar } from 'react-icons/fa';

const deptConfig = {
  programming: { name: 'البرمجة', icon: <FaCode />, gradient: 'from-blue-500 to-blue-700', glow: 'shadow-blue-500/20' },
  networks: { name: 'الشبكات', icon: <FaNetworkWired />, gradient: 'from-emerald-500 to-emerald-700', glow: 'shadow-emerald-500/20' },
  communications: { name: 'الاتصالات', icon: <FaSatelliteDish />, gradient: 'from-pink-500 to-pink-700', glow: 'shadow-pink-500/20' },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const dept = deptConfig[user?.department] || deptConfig.programming;
  const [matchStats, setMatchStats] = useState(null);

  useEffect(() => {
    API.get('/match/stats').then(({ data }) => setMatchStats(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dash-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo('.dash-card', { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.4)', delay: 0.3 });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const cards = [
    {
      title: 'ابدأ الاختبار',
      subtitle: 'اختبر معلوماتك الآن',
      icon: <FaPlay size={32} />,
      gradient: `bg-gradient-to-br ${dept.gradient}`,
      action: () => navigate('/exam'),
    },
    {
      title: 'العب مباراة',
      subtitle: matchStats ? `${matchStats.points} نقطة • ${matchStats.wins} فوز` : 'تحدَّ أصدقاءك مباشرة',
      icon: <FaGamepad size={32} />,
      gradient: 'bg-gradient-to-br from-indigo-500 to-fuchsia-600',
      action: () => navigate('/match'),
    },
    {
      title: 'لوحة المتصدرين',
      subtitle: 'تعرف على ترتيبك بين الطلاب',
      icon: <FaTrophy size={32} />,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
      action: () => navigate('/leaderboard'),
    },
    {
      title: 'نتائجي السابقة',
      subtitle: 'راجع أداءك في الاختبارات',
      icon: <FaClipboardList size={32} />,
      gradient: 'bg-gradient-to-br from-primary-500 to-primary-600',
      action: () => navigate('/results'),
    },
    {
      title: 'الملف الشخصي',
      subtitle: 'عرض وتعديل بياناتك',
      icon: <FaUser size={32} />,
      gradient: 'bg-gradient-to-br from-cyan-500 to-teal-600',
      action: () => navigate('/profile'),
    },
  ];

  return (
    <div ref={pageRef} className="page-container bg-mesh">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="dash-header text-center mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-l ${dept.gradient} text-white text-sm font-bold mb-4 shadow-lg ${dept.glow}`}>
            {dept.icon}
            {dept.name}
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            مرحباً، <span className="gradient-text">{user?.fullName}</span>
          </h1>
          <p className="text-dark-400 text-lg">ماذا تريد أن تفعل اليوم؟</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <button
              key={i}
              onClick={card.action}
              className="dash-card glass-card-hover p-6 text-right group cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className={`w-16 h-16 rounded-2xl ${card.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <div className="flex-1 mr-4">
                  <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-dark-400 text-sm">{card.subtitle}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-primary-400 text-sm font-bold group-hover:text-primary-300 transition-colors flex items-center gap-1">
                  انتقل الآن ←
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
