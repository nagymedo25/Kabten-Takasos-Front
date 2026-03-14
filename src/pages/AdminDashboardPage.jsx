import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import gsap from 'gsap';
import { toast } from 'react-toastify';
import { FaUsers, FaQuestionCircle, FaChartLine, FaRobot, FaTrash, FaEdit, FaSearch, FaEye, FaTimes, FaCheck } from 'react-icons/fa';
import UserAvatar from '../components/UserAvatar';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ fullName: '', username: '', department: '', password: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, resultsRes] = await Promise.all([
          API.get('/users'),
          API.get('/results')
        ]);
        setUsers(usersRes.data);
        setResults(resultsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.stat-card', { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)' });
        gsap.fromTo('.admin-row', { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.4 });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success('تم حذف المستخدم');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user._id);
    setEditFormData({
      fullName: user.fullName || '',
      username: user.username || '',
      department: user.department || '',
      password: ''
    });
  };

  const handleEditSave = async () => {
    try {
      const { data } = await API.put(`/users/${editingUser}`, editFormData);
      setUsers(users.map(u => (u._id === editingUser ? { ...u, ...data } : u)));
      toast.success('تم تحديث بيانات الطالب بنجاح');
      setEditingUser(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'إجمالي الطلاب', value: users.filter(u => u.role === 'student').length, icon: <FaUsers />, gradient: 'from-blue-500 to-blue-700' },
    { label: 'إجمالي الاختبارات', value: results.length, icon: <FaChartLine />, gradient: 'from-emerald-500 to-emerald-700' },
    { label: 'إدارة الأسئلة', value: 'انتقل', icon: <FaQuestionCircle />, gradient: 'from-primary-500 to-primary-600', action: () => navigate('/admin/questions') },
    { label: 'استيراد بالذكاء الاصطناعي', value: 'انتقل', icon: <FaRobot />, gradient: 'from-pink-500 to-pink-700', action: () => navigate('/admin/ai-import') },
    { label: 'إحصائيات المباريات', value: 'انتقل', icon: <FaChartLine />, gradient: 'from-indigo-500 to-fuchsia-600', action: () => navigate('/admin/matches') },
  ];

  const deptNames = { programming: 'البرمجة', networks: 'الشبكات', communications: 'الاتصالات' };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="page-container bg-mesh relative">
      <div className="max-w-6xl mx-auto">
        <h1 className="section-title">لوحة تحكم المسؤول</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <button
              key={i}
              onClick={stat.action}
              className={`stat-card glass-card-hover p-5 text-center ${stat.action ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white text-xl shadow-lg mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-dark-400 text-sm">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="البحث عن طالب (الاسم أو اسم المستخدم)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10"
          />
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="px-4 py-3 text-right text-dark-400 text-sm font-bold">الطالب</th>
                  <th className="px-4 py-3 text-right text-dark-400 text-sm font-bold">القسم</th>
                  <th className="px-4 py-3 text-right text-dark-400 text-sm font-bold">حالة الدخول</th>
                  <th className="px-4 py-3 text-center text-dark-400 text-sm font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="admin-row border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          user={u}
                          size="w-8 h-8"
                          textSize="text-xs"
                          rounded="rounded-lg"
                        />
                        <div>
                          <p className="text-white text-sm font-bold">{u.fullName}</p>
                          <p className="text-dark-400 text-xs" dir="ltr">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-300 text-sm">{deptNames[u.department] || 'غير محدد'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        u.onboarded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-400'
                      }`}>
                        {u.onboarded ? 'مكتمل' : 'جديد'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => navigate(`/admin/student/${u._id}`)}
                          className="text-dark-400 hover:text-emerald-400 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <FaEye size={18} />
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="text-dark-400 hover:text-primary-400 transition-colors"
                          title="تعديل"
                        >
                          <FaEdit size={18} />
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-dark-400 hover:text-red-400 transition-colors"
                            title="حذف"
                          >
                            <FaTrash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-dark-400">لا يوجد طلاب مطابقين للبحث</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 md:backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-700 flex items-center justify-between bg-dark-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaEdit className="text-primary-400" />
                تعديل بيانات الطالب
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-bold mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-bold mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  className="input-field"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-bold mb-2">القسم</label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="input-field"
                >
                  <option value="">غير محدد</option>
                  {Object.entries(deptNames).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-bold mb-2">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="input-field"
                  placeholder="اترك هذا الحقل فارغاً إذا لم ترغب بتغيير كلمة المرور"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="p-4 border-t border-dark-700 bg-dark-800/50 flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="btn-secondary">إلغاء</button>
              <button onClick={handleEditSave} className="btn-primary flex items-center gap-2">
                <FaCheck />
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
