import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { FaUser, FaLock, FaSignInAlt, FaRocket, FaBrain, FaTrophy, FaQuoteRight } from 'react-icons/fa';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.anim-left', { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out' });
      gsap.fromTo('.anim-right', { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.3 });
      gsap.fromTo('.floating-bg', { y: 0 }, { y: -20, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      toast.success('مرحباً بك في كابتن تخصص! 🎉');
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(user.onboarded ? '/dashboard' : '/onboarding');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen flex items-center justify-center p-4 lg:p-10 relative overflow-hidden bg-dark-950">
      
      {/* Advanced Animated Geometric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Deep glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating Shapes */}
        {[...Array(6)].map((_, i) => (
          <div key={`shape-${i}`} className="absolute border-2 border-primary-500/20 rounded-xl animate-float opacity-30"
               style={{
                 width: `${50 + Math.random() * 80}px`,
                 height: `${50 + Math.random() * 80}px`,
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 animationDelay: `${i * 0.7}s`,
                 animationDuration: `${5 + Math.random() * 4}s`,
                 transform: `rotate(${Math.random() * 360}deg)`,
               }} />
        ))}

        {/* Floating Dots */}
        {[...Array(15)].map((_, i) => (
          <div key={`dot-${i}`} className="absolute w-2 h-2 rounded-full bg-emerald-500/40 animate-pulse"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 animationDelay: `${Math.random() * 5}s`,
                 animationDuration: `${2 + Math.random() * 3}s`,
               }} />
        ))}

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      <div className="max-w-6xl w-full flex flex-col lg:flex-row gap-8 lg:gap-16 z-10">
        
        {/* Info & Branding Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 text-center lg:text-right anim-left hidden lg:flex">
          <div className="flex items-center justify-center lg:justify-start gap-4 floating-bg">
            <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/40 border-2 border-primary-500/20 bg-dark-800 p-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img src="/Logo.png" alt="كابتن تخصص" className="w-full h-full object-contain relative z-10" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-l from-primary-400 to-emerald-400 mb-2">كابتن تخصص</h1>
              <p className="text-xl text-dark-300 font-bold">بوابتك للتميز الأكاديمي</p>
            </div>
          </div>
          
          <div className="space-y-6 mt-8 p-8 glass-card border-none bg-dark-800/40 relative">
            <FaQuoteRight className="absolute top-4 right-4 text-4xl text-primary-500/10" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                <FaBrain className="text-xl text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">ذكاء اصطناعي متطور</h3>
                <p className="text-dark-400 text-sm leading-relaxed">تتدرب لتتغلب على التحديات عبر أنظمة اختبارات ذكية، تُحلل أدائك وترى ما لا تراه.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <FaTrophy className="text-xl text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">منافسة وتحدي مستمر</h3>
                <p className="text-dark-400 text-sm leading-relaxed">اختبر نفسك ضد زملائك في القسم، وتصدر لوحات الشرف، واثبت جدارتك الحقيقية بكل امتحان.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <FaRocket className="text-xl text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">بيئات غنية بالثيمات</h3>
                <p className="text-dark-400 text-sm leading-relaxed">انتقل بلمح البصر إلى عوالم مخصصة للبرمجة، الشبكات، أو الاتصالات مع مؤثرات بصرية تبهر الانفاس.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-end anim-right relative">
          <div className="glass-card p-8 sm:p-10 w-full max-w-md border-t-4 border-t-primary-500 shadow-2xl relative overflow-hidden">
            
            {/* Ornaments in Form */}
            <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-primary-500/20 blur-[50px] rounded-full"></div>
            <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>

            <div className="text-center mb-10 relative z-10">
              <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg shadow-primary-500/30 mb-4 lg:hidden bg-dark-800 p-2">
                <img src="/Logo.png" alt="كابتن تخصص" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h2>
              <p className="text-dark-400 text-sm">أهلاً بك مجدداً، استعد لجولتك القادمة!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="relative group">
                <label className="block text-xs font-bold text-dark-400 mb-2 group-focus-within:text-primary-400 transition-colors">اسم المستخدم</label>
                <div className="relative">
                  <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors z-10" />
                  <input
                    type="text"
                    placeholder="أدخل اسم المستخدم..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input-field pr-12 w-full bg-dark-900/50 border-dark-600 focus:border-primary-500 focus:bg-dark-800/80 transition-all font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-bold text-dark-400 mb-2 group-focus-within:text-primary-400 transition-colors">كلمة المرور</label>
                <div className="relative">
                  <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-primary-400 transition-colors z-10" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pr-12 w-full bg-dark-900/50 border-dark-600 focus:border-primary-500 focus:bg-dark-800/80 transition-all font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-3 text-lg py-4 relative overflow-hidden group mt-8"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white relative z-10"></div>
                ) : (
                  <>
                    <span className="font-black tracking-wide relative z-10">تسجيل الدخول</span>
                    <FaSignInAlt className="relative z-10" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-dark-700/50 text-center relative z-10">
              <p className="text-dark-400 text-sm">
                طالب جديد معنا؟{' '}
                <Link to="/register" className="text-primary-400 hover:text-white font-black transition-colors underline decoration-primary-500/50 underline-offset-4">
                  إنشاء حساب مجاني
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
