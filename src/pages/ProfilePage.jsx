import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import { FaUser, FaSave, FaCode, FaNetworkWired, FaSatelliteDish, FaCamera } from 'react-icons/fa';

const deptInfo = {
  programming: { name: 'البرمجة', icon: <FaCode />, color: 'text-blue-400' },
  networks: { name: 'الشبكات', icon: <FaNetworkWired />, color: 'text-emerald-400' },
  communications: { name: 'الاتصالات', icon: <FaSatelliteDish />, color: 'text-pink-400' },
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const pageRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profileImage || null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.profile-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put(`/users/${user._id}`, formData);
      updateUser(data);
      toast.success('تم تحديث الملف الشخصي بنجاح ✅');
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview locally
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary via server
    setImageLoading(true);
    try {
      const form = new FormData();
      form.append('profileImage', file);
      const { data } = await API.put(`/users/${user._id}/profile-image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data);
      setPreviewImage(data.profileImage);
      toast.success('تم تحديث الصورة الشخصية ✅');
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل رفع الصورة');
      setPreviewImage(user?.profileImage || null);
    } finally {
      setImageLoading(false);
    }
  };

  const dept = deptInfo[user?.department];
  const initials = user?.fullName?.charAt(0) || '؟';

  return (
    <div ref={pageRef} className="page-container bg-mesh">
      <div className="max-w-2xl mx-auto">
        <h1 className="section-title">الملف الشخصي</h1>

        <div className="profile-card glass-card p-8">
          {/* Avatar & Info */}
          <div className="flex flex-col items-center mb-8">
            {/* Profile Picture */}
            <div className="relative mb-4 group">
              <div
                className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-primary-500/25 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="صورة الملف الشخصي"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {imageLoading ? (
                    <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-white" />
                  ) : (
                    <FaCamera className="text-white text-2xl" />
                  )}
                </div>
              </div>

              {/* Camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageLoading}
                className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-primary-500 hover:bg-primary-400 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                title="تغيير الصورة"
              >
                {imageLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                ) : (
                  <FaCamera className="text-xs" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
            <p className="text-dark-400" dir="ltr">@{user?.username}</p>
            {dept && (
              <span className={`mt-2 flex items-center gap-2 px-4 py-1 rounded-full bg-dark-700 ${dept.color} text-sm font-bold`}>
                {dept.icon}
                {dept.name}
              </span>
            )}
            <p className="text-dark-500 text-xs mt-2">اضغط على الصورة لتغييرها</p>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="الاسم الكامل"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="input-field pr-10"
              />
            </div>
            <div className="relative">
              <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="اسم المستخدم"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field pr-10"
                dir="ltr"
              />
            </div>

            {/* Password input */}
            <div className="relative mt-4 border-t border-dark-700/50 pt-6 group">
              <label className="block text-xs font-bold text-dark-400 mb-2 group-focus-within:text-primary-400 transition-colors">تغيير كلمة المرور (أتركه فارغاً إذا لم ترد التغيير)</label>
              <div className="relative">
                <FaCode className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pr-10"
                  dir="ltr"
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
              ) : (
                <>
                  <FaSave />
                  حفظ التغييرات
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
