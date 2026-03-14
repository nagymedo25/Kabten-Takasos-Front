import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import gsap from 'gsap';
import { FaGamepad, FaTrophy, FaUsers, FaChartBar, FaArrowRight } from 'react-icons/fa';

const AdminMatchStatsPage = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/match/admin-stats');
        setStats(data);
      } catch (error) {
        console.error('Admin match stats error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading && stats && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.stat-card', { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)' });
        gsap.fromTo('.match-row', { x: -15, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.4 });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading, stats]);

  const diffLabels = { easy: 'سهلة', medium: 'متوسطة', hard: 'صعبة' };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container text-center">
        <p className="text-dark-400">لا توجد بيانات مباريات بعد</p>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="page-container bg-mesh">
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <FaArrowRight />
          العودة للوحة التحكم
        </button>

        <h1 className="section-title flex items-center gap-3">
          <FaGamepad className="text-primary-400" />
          إحصائيات المباريات
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card glass-card p-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xl shadow-lg mb-3">
              <FaGamepad />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalMatches}</p>
            <p className="text-dark-400 text-sm">إجمالي المباريات</p>
          </div>

          {stats.difficultyBreakdown.map((d) => (
            <div key={d.difficulty} className="stat-card glass-card p-5 text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-white text-xl shadow-lg mb-3 ${
                d.difficulty === 'easy' ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' :
                d.difficulty === 'medium' ? 'bg-gradient-to-br from-amber-500 to-amber-700' :
                'bg-gradient-to-br from-red-500 to-red-700'
              }`}>
                <FaChartBar />
              </div>
              <p className="text-2xl font-bold text-white">{d.count}</p>
              <p className="text-dark-400 text-sm">مباراة {diffLabels[d.difficulty]}</p>
            </div>
          ))}
        </div>

        {/* Top Players */}
        {stats.topPlayers.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaTrophy className="text-amber-400" />
              أفضل اللاعبين
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="px-4 py-3 text-right text-dark-400 text-sm font-bold">اللاعب</th>
                    <th className="px-4 py-3 text-center text-dark-400 text-sm font-bold">النقاط</th>
                    <th className="px-4 py-3 text-center text-dark-400 text-sm font-bold">الفوز</th>
                    <th className="px-4 py-3 text-center text-dark-400 text-sm font-bold">المباريات</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPlayers.map((p, i) => (
                    <tr key={i} className="match-row border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-dark-400 font-bold text-sm w-6">{i + 1}</span>
                          <div>
                            <p className="text-white text-sm font-bold">{p.fullName}</p>
                            <p className="text-dark-400 text-xs" dir="ltr">@{p.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-amber-400 font-bold">{p.points}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-emerald-400 font-bold">{p.wins}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-dark-300 text-sm">{p.totalMatches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Matches */}
        {stats.recentMatches.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FaUsers className="text-primary-400" />
              آخر المباريات
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="px-4 py-3 text-right text-dark-400 text-sm font-bold">اللاعب 1</th>
                    <th className="px-4 py-3 text-center text-dark-400 text-sm font-bold">النتيجة</th>
                    <th className="px-4 py-3 text-right text-dark-400 text-sm font-bold">اللاعب 2</th>
                    <th className="px-4 py-3 text-center text-dark-400 text-sm font-bold">المستوى</th>
                    <th className="px-4 py-3 text-right text-dark-400 text-sm font-bold">الفائز</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentMatches.map((m, i) => (
                    <tr key={i} className="match-row border-b border-dark-700/50 hover:bg-dark-800/50 transition-colors">
                      <td className="px-4 py-3 text-white text-sm">{m.player1Name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-primary-400 font-bold">{m.player1Correct}</span>
                        <span className="text-dark-500 mx-1">-</span>
                        <span className="text-pink-400 font-bold">{m.player2Correct}</span>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">{m.player2Name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          m.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                          m.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {diffLabels[m.difficulty]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-amber-400 text-sm font-bold">
                        {m.winnerName || 'تعادل'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMatchStatsPage;
