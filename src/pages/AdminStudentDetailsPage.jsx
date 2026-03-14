import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import gsap from 'gsap';
import { toast } from 'react-toastify';
import { FaUser, FaChartLine, FaCheckCircle, FaTimesCircle, FaArrowRight, FaSpinner, FaHistory } from 'react-icons/fa';
import UserAvatar from '../components/UserAvatar';

const AdminStudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [userRes, resultsRes] = await Promise.all([
          API.get(`/users/${id}`),
          API.get(`/results/user/${id}`)
        ]);
        setUser(userRes.data);
        setResults(resultsRes.data);
      } catch (error) {
        toast.error('لم يتم العثور على الطالب أخطأ في جلب البيانات');
        navigate('/admin');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id, navigate]);

  useEffect(() => {
    if (!loading && user) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.stat-box', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)' });
        gsap.fromTo('.history-row', { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.3 });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-primary-500">
          <FaSpinner className="animate-spin text-4xl" />
          <p className="text-white font-bold">جاري تحميل بيانات الطالب...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate stats
  const totalExams = results.length;
  const bestScore = totalExams > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const avgScore = totalExams > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / totalExams) : 0;
  const totalCorrect = results.reduce((acc, r) => acc + r.correctAnswers, 0);
  const totalQuestions = results.reduce((acc, r) => acc + r.totalQuestions, 0);
  const totalCorrectPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const deptNames = { programming: 'البرمجة', networks: 'الشبكات', communications: 'الاتصالات' };

  return (
    <div ref={pageRef} className="page-container bg-mesh">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <UserAvatar
              user={user}
              size="w-16 h-16"
              textSize="text-2xl"
              className="shadow-lg shadow-primary-500/30"
            />
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{user.fullName}</h1>
              <div className="flex items-center gap-3 text-sm text-dark-300">
                <span dir="ltr">@{user.username}</span>
                <span>•</span>
                <span>{deptNames[user.department] || 'غير محدد'}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                  user.onboarded ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {user.onboarded ? 'حساب مكتمل' : 'جديد'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/admin')} className="btn-secondary flex items-center gap-2">
            العودة للوحة التحكم
            <FaArrowRight />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-box glass-card p-5 border-t-4 border-t-blue-500">
            <div className="flex items-center gap-3 mb-2 text-dark-300">
              <FaHistory className="text-blue-500" />
              <h3 className="font-bold">إجمالي الاختبارات</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totalExams}</p>
          </div>
          
          <div className="stat-box glass-card p-5 border-t-4 border-t-emerald-500">
            <div className="flex items-center gap-3 mb-2 text-dark-300">
              <FaCheckCircle className="text-emerald-500" />
              <h3 className="font-bold">أفضل نتيجة</h3>
            </div>
            <p className="text-3xl font-bold text-white">{bestScore}</p>
          </div>
          
          <div className="stat-box glass-card p-5 border-t-4 border-t-purple-500">
            <div className="flex items-center gap-3 mb-2 text-dark-300">
              <FaChartLine className="text-purple-500" />
              <h3 className="font-bold">متوسط الدرجات</h3>
            </div>
            <p className="text-3xl font-bold text-white">{avgScore}</p>
          </div>

          <div className="stat-box glass-card p-5 border-t-4 border-t-primary-500">
            <div className="flex items-center gap-3 mb-2 text-dark-300">
              <FaCheckCircle className="text-primary-500" />
              <h3 className="font-bold">دقة الإجابات</h3>
            </div>
            <p className="text-3xl font-bold text-white">{totalCorrectPercentage}%</p>
            <p className="text-xs text-dark-400 mt-1">{totalCorrect} إجابة صحيحة من أصل {totalQuestions}</p>
          </div>
        </div>

        {/* Exams History Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-5 border-b border-dark-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaHistory className="text-primary-500" />
              سجل الاختبارات السابقة
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-800/50">
                  <th className="px-5 py-3 text-right text-dark-300 font-bold text-sm">التاريخ</th>
                  <th className="px-5 py-3 text-right text-dark-300 font-bold text-sm">القسم</th>
                  <th className="px-5 py-3 text-right text-dark-300 font-bold text-sm">الدرجة</th>
                  <th className="px-5 py-3 text-right text-dark-300 font-bold text-sm">الإجابات الصحيحة / الخاطئة</th>
                  <th className="px-5 py-3 text-center text-dark-300 font-bold text-sm">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((result) => (
                    <tr key={result._id} className="history-row border-b border-dark-700/50 hover:bg-dark-800/30 transition-colors">
                      <td className="px-5 py-4 text-sm text-dark-200">
                        {new Date(result.createdAt).toLocaleString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Africa/Cairo'
                        })}
                      </td>
                      <td className="px-5 py-4 text-sm text-dark-200 font-bold">
                        {deptNames[result.department] || result.department}
                      </td>
                      <td className="px-5 py-4 text-sm text-white font-bold text-lg">
                        {result.score}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-emerald-400 text-sm bg-emerald-500/10 px-2 py-1 rounded-lg">
                            <FaCheckCircle size={12} /> {result.correctAnswers}
                          </span>
                          <span className="flex items-center gap-1 text-red-400 text-sm bg-red-500/10 px-2 py-1 rounded-lg">
                            <FaTimesCircle size={12} /> {result.wrongAnswers}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${
                          result.percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                          result.percentage >= 50 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {result.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-dark-400">
                      لم يقم هذا الطالب بأداء أي اختبارات حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminStudentDetailsPage;
