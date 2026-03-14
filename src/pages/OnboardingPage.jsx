import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import API from '../api/axios';
import { FaCode, FaNetworkWired, FaSatelliteDish } from 'react-icons/fa';

const departments = [
  {
    id: 'programming',
    name: 'البرمجة',
    nameEn: 'Programming',
    icon: <FaCode size={40} />,
    color: 'from-blue-500 to-blue-700',
    border: 'border-blue-500/30 hover:border-blue-500/60',
    shadow: 'hover:shadow-blue-500/20',
    bg: 'bg-blue-500/10',
    description: 'تعلم البرمجة وقواعد البيانات والخوارزميات'
  },
  {
    id: 'networks',
    name: 'الشبكات',
    nameEn: 'Networks',
    icon: <FaNetworkWired size={40} />,
    color: 'from-emerald-500 to-emerald-700',
    border: 'border-emerald-500/30 hover:border-emerald-500/60',
    shadow: 'hover:shadow-emerald-500/20',
    bg: 'bg-emerald-500/10',
    description: 'الشبكات والبروتوكولات وأمن المعلومات'
  },
  {
    id: 'communications',
    name: 'الاتصالات',
    nameEn: 'Communications',
    icon: <FaSatelliteDish size={40} />,
    color: 'from-pink-500 to-pink-700',
    border: 'border-pink-500/30 hover:border-pink-500/60',
    shadow: 'hover:shadow-pink-500/20',
    bg: 'bg-pink-500/10',
    description: 'الاتصالات والإشارات والأنظمة'
  }
];

const OnboardingPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [loadingDept, setLoadingDept] = useState(null);

  useEffect(() => {
    if (user?.onboarded) {
      navigate('/dashboard');
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo('.onboard-title', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      gsap.fromTo('.dept-card', { y: 50, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.2, ease: 'back.out(1.7)', delay: 0.3 });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleSelect = async (department) => {
    setLoadingDept(department);
    try {
      const { data } = await API.put('/users/onboard', { department });
      // This will instantly trigger the ThemeProvider to switch themes
      updateUser({ department, onboarded: true });
      toast.success('تم اختيار القسم بنجاح! يتم تجهيز عالمك... 🎨');
      
      // Wait 1.5s so user can admire the new theme before navigating
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
      setLoadingDept(null);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col items-center justify-center px-4 bg-mesh">
      <div className="text-center mb-12 onboard-title">
        <h1 className="text-4xl font-bold gradient-text mb-4">اختر تخصصك</h1>
        <p className="text-dark-400 text-lg">
          مرحباً <span className="text-primary-400 font-bold">{user?.fullName}</span>! اختر القسم الذي تريد التحضير له
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => handleSelect(dept.id)}
            disabled={loadingDept !== null}
            className={`dept-card glass-card ${dept.border} ${dept.shadow} p-8 text-center group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer
              ${loadingDept && loadingDept !== dept.id ? 'opacity-50 grayscale scale-95' : ''}
              ${loadingDept === dept.id ? 'ring-2 ring-white scale-105' : ''}
            `}
          >
            <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 relative`}>
              {loadingDept === dept.id ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : null}
              {dept.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{dept.name}</h2>
            <p className="text-dark-400 text-sm mb-4">{dept.nameEn}</p>
            <p className="text-dark-300 text-sm">{dept.description}</p>
            <div className={`mt-6 py-2 px-6 rounded-xl ${dept.bg} text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
              {loadingDept === dept.id ? 'جاري تجهيز عالمك...' : 'اختيار هذا التخصص'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OnboardingPage;
