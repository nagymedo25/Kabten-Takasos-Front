import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import gsap from 'gsap';
import { FaTrophy, FaMedal, FaCrown, FaInfoCircle } from 'react-icons/fa';
import UserAvatar from '../components/UserAvatar';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeDept, setActiveDept] = useState(user?.department || 'programming');
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);

  const departments = [
    { id: 'programming', name: 'البرمجة', color: 'from-blue-500 to-blue-700' },
    { id: 'networks', name: 'الشبكات', color: 'from-emerald-500 to-emerald-700' },
    { id: 'communications', name: 'الاتصالات', color: 'from-pink-500 to-pink-700' },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/leaderboard/${activeDept}`);
        setLeaderboard(data);
      } catch (error) {
        console.error(error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeDept]);

  useEffect(() => {
    if (!loading && leaderboard.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.lb-row', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out' });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading, leaderboard]);

  const getRankIcon = (rank) => {
    if (rank === 0) return <FaCrown className="text-yellow-400 text-xl" />;
    if (rank === 1) return <FaMedal className="text-gray-300 text-xl" />;
    if (rank === 2) return <FaMedal className="text-amber-600 text-xl" />;
    return <span className="text-dark-400 font-bold">{rank + 1}</span>;
  };

  const getRankBg = (rank) => {
    if (rank === 0) return 'bg-gradient-to-l from-yellow-500/10 to-amber-500/5 border-yellow-500/30';
    if (rank === 1) return 'bg-gradient-to-l from-gray-400/10 to-gray-500/5 border-gray-400/30';
    if (rank === 2) return 'bg-gradient-to-l from-amber-600/10 to-amber-700/5 border-amber-600/30';
    return '';
  };

  return (
    <div ref={pageRef} className="page-container bg-mesh">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="section-title flex items-center justify-center gap-3">
            <FaTrophy className="text-amber-400" />
            لوحة المتصدرين
          </h1>
        </div>

        {/* Department Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDept(dept.id)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeDept === dept.id
                  ? `bg-gradient-to-l ${dept.color} text-white shadow-lg`
                  : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Scoring Rules Banner */}
        <div className="glass-card p-4 mb-8 border-l-4 border-l-amber-400 bg-amber-500/5 flex items-start gap-3">
          <FaInfoCircle className="text-amber-400 text-xl mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h3 className="text-amber-400 font-bold mb-1">كيفية احتساب النقاط:</h3>
            <ul className="list-disc list-inside text-dark-300 space-y-1">
              <li>تحصل على <span className="text-white font-bold">1 نقطة</span> لكل <span className="text-emerald-400 font-bold">10%</span> من نتيجتك في أي اختبار (مثال: 70% = 7 نقاط).</li>
              <li>النقاط <span className="text-blue-400 font-bold">تتراكم</span> من جميع اختباراتك السابقة.</li>
              <li><span className="text-yellow-400 font-bold">مكافأة خاصة:</span> إذا حصلت على نتيجة <span className="text-emerald-400 font-bold">100%</span> في الاختبار، ستحصل على <span className="text-yellow-400 font-bold">+3 نقاط إضافية</span>!</li>
            </ul>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FaTrophy className="mx-auto text-dark-600 text-5xl mb-4" />
            <p className="text-dark-400 text-lg">لا توجد نتائج لهذا القسم بعد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 md:gap-4 px-2 md:px-4 py-2 text-dark-400 text-[10px] md:text-sm font-bold uppercase tracking-wider">
              <div className="col-span-2 md:col-span-1 text-center">#</div>
              <div className="col-span-7 md:col-span-7">الطالب</div>
              <div className="hidden md:block md:col-span-2 text-center">الاختبارات</div>
              <div className="col-span-3 md:col-span-2 text-center">النقاط</div>
            </div>

            {/* Rows */}
            {leaderboard.map((entry, i) => (
              <div
                key={entry.userId}
                className={`lb-row glass-card grid grid-cols-12 gap-2 md:gap-4 items-center px-2 md:px-4 py-3 md:py-4 transition-all duration-300 hover:border-primary-500/30 ${getRankBg(i)} ${
                  entry.userId === user?._id ? 'ring-1 ring-primary-500/30 bg-primary-500/5' : ''
                }`}
              >
                <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                  {getRankIcon(i)}
                </div>
                <div className="col-span-7 md:col-span-7 flex items-center gap-2 md:gap-3">
                  <UserAvatar
                    name={entry.fullName}
                    image={entry.profileImage}
                    size="w-8 h-8 md:w-10 md:h-10"
                    textSize="text-[10px] md:text-sm"
                    className="shadow-lg shadow-primary-500/20"
                  />
                  <div className="min-w-0">
                    <p className="text-white font-bold text-xs md:text-sm truncate">{entry.fullName}</p>
                    <p className="text-dark-400 text-[10px] md:text-xs truncate" dir="ltr">@{entry.username}</p>
                  </div>
                </div>
                <div className="hidden md:block md:col-span-2 text-center text-dark-300 text-sm">{entry.totalExams}</div>
                <div className={`col-span-3 md:col-span-2 text-center font-bold text-base md:text-lg ${
                  i < 3 ? 'text-amber-400' : 'text-primary-400'
                }`}>
                  {entry.totalPoints} <span className="text-[10px] md:text-xs text-dark-400 block md:inline-block">نقطة</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
