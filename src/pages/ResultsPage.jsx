import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import gsap from 'gsap';
import { FaCheckCircle, FaTimesCircle, FaChartBar, FaSearch, FaFilter, FaInfoCircle } from 'react-icons/fa';

const ResultsPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  
  // Review Filters State
  const [reviewFilter, setReviewFilter] = useState('all'); // all, correct, wrong
  const [reviewSearch, setReviewSearch] = useState('');

  const pageRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await API.get('/results/my');
        setResults(data);
        if (data.length > 0) setSelectedResult(data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.result-item', { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading]);
  
  // Reset filters when a new result is selected
  useEffect(() => {
    if (selectedResult) {
      setReviewFilter('all');
      setReviewSearch('');
    }
  }, [selectedResult?._id]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const getScoreColor = (pct) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (pct) => {
    if (pct >= 80) return 'from-emerald-500 to-emerald-700';
    if (pct >= 60) return 'from-amber-500 to-amber-700';
    return 'from-red-500 to-red-700';
  };

  const typeLabels = {
    multiple_choice: 'اختيار من متعدد',
    true_false: 'صح أو خطأ',
    fill_blank: 'أكمل الفراغ',
    matching: 'توصيل',
    essay: 'مقالي'
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter the answers for the review section
  const filteredAnswers = selectedResult?.answers?.filter(ans => {
    // 1. Text Search Filter
    const matchesSearch = !reviewSearch || 
      (ans.questionText && ans.questionText.toLowerCase().includes(reviewSearch.toLowerCase())) ||
      (ans.userAnswer && ans.userAnswer.toLowerCase().includes(reviewSearch.toLowerCase()));
      
    // 2. Correctness Filter
    const matchesFilter = reviewFilter === 'all' || 
      (reviewFilter === 'correct' && ans.isCorrect) ||
      (reviewFilter === 'wrong' && !ans.isCorrect);

    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div ref={pageRef} className="page-container bg-mesh">
      <div className="max-w-6xl mx-auto">
        <h1 className="section-title">نتائجي السابقة</h1>

        {results.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FaChartBar className="mx-auto text-dark-600 text-5xl mb-4" />
            <p className="text-dark-400 text-lg">لا توجد نتائج بعد. ابدأ اختباراً الآن!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Results List */}
            <div className="space-y-3">
              {results.map((r, i) => (
                <button
                  key={r._id}
                  onClick={() => setSelectedResult(r)}
                  className={`result-item w-full text-right glass-card p-4 transition-all duration-300 cursor-pointer flex flex-col items-start ${
                    selectedResult?._id === r._id ? 'border-primary-500/50 bg-primary-500/5 shadow-lg shadow-primary-500/10' : 'hover:border-dark-500 hover:bg-dark-800/50'
                  }`}
                >
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className={`text-2xl font-bold ${getScoreColor(r.percentage)}`}>{r.percentage}%</span>
                    <div className="text-left">
                      <p className="text-white text-sm font-bold truncate">اختبار #{results.length - i}</p>
                      <p className="text-dark-400 text-xs">
                        {new Date(r.createdAt).toLocaleString('ar-EG', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                          timeZone: 'Africa/Cairo'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between text-xs mt-1 border-t border-dark-700/50 pt-2">
                    <span className="text-emerald-400 flex items-center gap-1"><FaCheckCircle size={10} /> {r.correctAnswers}</span>
                    <span className="text-red-400 flex items-center gap-1"><FaTimesCircle size={10} /> {r.wrongAnswers}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Result Detail & Review */}
            {selectedResult && (
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Score Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="glass-card p-4 flex flex-col items-center justify-center text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getScoreBg(selectedResult.percentage)} flex items-center justify-center text-white text-xl font-bold shadow-lg mb-2`}>
                      {selectedResult.percentage}%
                    </div>
                    <p className="text-dark-300 text-xs font-bold">النسبة المئوية</p>
                  </div>
                  <div className="glass-card p-4 flex flex-col items-center justify-center text-center border-t-2 border-dark-600">
                    <div className="w-14 h-14 rounded-2xl bg-dark-700 flex items-center justify-center text-white text-xl font-bold mb-2">
                      {selectedResult.totalQuestions}
                    </div>
                    <p className="text-dark-300 text-xs font-bold">إجمالي الأسئلة</p>
                  </div>
                  <div className="glass-card p-4 flex flex-col items-center justify-center text-center border-t-2 border-emerald-500/50">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl font-bold mb-2">
                      {selectedResult.correctAnswers}
                    </div>
                    <p className="text-dark-300 text-xs font-bold">إجابات صحيحة</p>
                  </div>
                  <div className="glass-card p-4 flex flex-col items-center justify-center text-center border-t-2 border-red-500/50">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400 text-xl font-bold mb-2">
                      {selectedResult.wrongAnswers}
                    </div>
                    <p className="text-dark-300 text-xs font-bold">إجابات خاطئة</p>
                  </div>
                  <div className="glass-card p-4 flex flex-col items-center justify-center text-center border-t-2 border-blue-500/50">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl font-bold mb-2">
                      {formatTime(selectedResult.timeSpent)}
                    </div>
                    <p className="text-dark-300 text-xs font-bold">الوقت المستغرق</p>
                  </div>
                </div>

                {/* 2. Topic Breakdown */}
                {selectedResult.topicBreakdown && selectedResult.topicBreakdown.length > 0 && (
                  <div className="glass-card p-5">
                    <h3 className="text-lg font-bold text-white mb-4 border-b border-dark-700 pb-2">تحليل حسب الموضوع</h3>
                    <div className="space-y-4">
                      {selectedResult.topicBreakdown.map((topic, i) => {
                        const pct = Math.round((topic.correct / topic.total) * 100);
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <span className="text-dark-200 font-bold" dir="ltr">{topic.topic}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getScoreColor(pct)} bg-dark-800`}>
                                {topic.correct}/{topic.total} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden shadow-inner flex">
                              <div
                                className={`h-full rounded-full bg-gradient-to-l ${getScoreBg(pct)}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* 3. Detailed Exam Review */}
                {selectedResult.answers && selectedResult.answers.length > 0 && (
                  <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b border-dark-700 bg-dark-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FaFilter className="text-primary-400" />
                        مراجعة الامتحان
                      </h3>
                      
                      {/* Filters */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
                          <button 
                            onClick={() => setReviewFilter('all')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${reviewFilter === 'all' ? 'bg-dark-700 text-white' : 'text-dark-400 hover:text-dark-200'}`}
                          >
                            الكل
                          </button>
                          <button 
                            onClick={() => setReviewFilter('correct')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${reviewFilter === 'correct' ? 'bg-emerald-500/20 text-emerald-400' : 'text-dark-400 hover:text-emerald-400/50'}`}
                          >
                            إجابات صحيحة
                          </button>
                          <button 
                            onClick={() => setReviewFilter('wrong')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${reviewFilter === 'wrong' ? 'bg-red-500/20 text-red-400' : 'text-dark-400 hover:text-red-400/50'}`}
                          >
                            خطأ
                          </button>
                        </div>
                        
                        <div className="relative">
                          <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 text-xs" />
                          <input 
                            type="text" 
                            placeholder="بحث في الأسئلة..." 
                            value={reviewSearch}
                            onChange={(e) => setReviewSearch(e.target.value)}
                            className="bg-dark-900 border border-dark-700 text-white text-xs rounded-lg pl-3 pr-8 py-2 w-full sm:w-48 focus:border-primary-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                      {filteredAnswers.length > 0 ? (
                        filteredAnswers.map((ans, idx) => (
                          <div 
                            key={ans.questionId || idx} 
                            className={`p-4 rounded-xl border ${ans.isCorrect ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}
                          >
                            {/* Question Header */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <p className="text-white text-sm font-bold leading-relaxed whitespace-pre-line" dir="ltr">
                                {ans.questionText || `سؤال ${idx + 1}`}
                              </p>
                              <div className="flex-shrink-0 pt-1">
                                {ans.isCorrect ? (
                                  <FaCheckCircle className="text-emerald-500 text-xl" title="إجابة صحيحة" />
                                ) : (
                                  <FaTimesCircle className="text-red-500 text-xl" title="إجابة خاطئة" />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-800 text-dark-300 border border-dark-700">
                                {typeLabels[ans.questionType] || ans.questionType || 'غير محدد'}
                              </span>
                            </div>

                            {/* Answers Display */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3 border-t border-dark-700/50 pt-4">
                              <div className="bg-dark-900/50 rounded-lg p-3 border border-dark-700/50">
                                <p className="text-xs text-dark-400 mb-1 font-bold">إجابتك:</p>
                                <p className={`font-medium ${ans.isCorrect ? 'text-emerald-400' : 'text-red-400'} break-words`} dir="ltr">
                                  {ans.userAnswer || 'لم يتم الإجابة'}
                                </p>
                              </div>
                              
                              {!ans.isCorrect && (
                                <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                                  <p className="text-xs text-emerald-500/70 mb-1 font-bold">الإجابة الصحيحة:</p>
                                  <p className="font-medium text-emerald-400 break-words" dir="ltr">
                                    {ans.correctAnswer || 'غير متوفرة'}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Explanation (if any) */}
                            {ans.explanation && (
                              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                                <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-blue-400 mb-1">شرح وتوضيح:</p>
                                  <p className="text-sm text-blue-200" dir="ltr">{ans.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-dark-400">
                          لا توجد أسئلة تطابق عوامل التصفية الحالية.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
