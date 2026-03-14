import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { FaUser, FaLock, FaImage, FaUserPlus } from 'react-icons/fa';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.register-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo('.register-field', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.3 });
    }, formRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('username', formData.username);
      data.append('password', formData.password);
      if (profileImage) data.append('profileImage', profileImage);

      await register(data);
      toast.success('تم إنشاء الحساب بنجاح! 🎉');
      navigate('/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={formRef} className="min-h-screen flex items-center justify-center px-4 py-10 bg-dark-950 relative overflow-hidden">
      
      {/* Advanced Animated Geometric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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

      <div className="register-card glass-card p-8 w-full max-w-md relative z-10 border-t-4 border-t-primary-500 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-lg shadow-primary-500/25 mb-4">
            <img src="/Logo.png" alt="كابتن تخصص" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">تسجيل حساب جديد</h1>
          <p className="text-dark-400 mt-2">انضم إلى كابتن تخصص وابدأ التدريب</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image Avatar Uploader */}
          <div className="register-field flex flex-col items-center justify-center mb-6">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-dark-600 bg-dark-800/50 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary-500 group-hover:bg-primary-500/10 shadow-lg">
                {profileImage ? (
                  <img src={URL.createObjectURL(profileImage)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-4xl text-dark-600 transition-colors duration-300" />
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full">
                  <span className="bg-primary-500 p-2 rounded-full text-white shadow-lg">
                    <FaImage size={16} />
                  </span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) setProfileImage(e.target.files[0]);
                }}
                className="hidden"
              />
            </label>
            <p className="text-xs text-dark-400 mt-3 font-bold">الافتار الشخصي</p>
          </div>

          {/* Full Name */}
          <div className="register-field relative">
            <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              name="fullName"
              placeholder="الاسم الكامل"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="input-field pr-10"
            />
          </div>

          {/* Username */}
          <div className="register-field relative">
            <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              name="username"
              placeholder="اسم المستخدم"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-field pr-10"
              dir="ltr"
            />
          </div>



          {/* Password */}
          <div className="register-field relative">
            <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field pr-10"
            />
          </div>

          {/* Confirm Password */}
          <div className="register-field relative">
            <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="تأكيد كلمة المرور"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input-field pr-10"
            />
          </div>



          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="register-field btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
            ) : (
              <>
                <FaUserPlus />
                تسجيل حساب
              </>
            )}
          </button>
        </form>

        <p className="text-center text-dark-400 mt-6">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
