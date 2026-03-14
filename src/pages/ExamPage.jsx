import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import gsap from 'gsap';
import API from '../api/axios';
import { FaClock, FaArrowLeft, FaArrowRight, FaCheck, FaPaperPlane } from 'react-icons/fa';

const ExamPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matchingStates, setMatchingStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  
  // Countdown states
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch ALL available questions for the department
        const { data } = await API.get(`/questions/exam/${user.department}`);
        setQuestions(data);
        setQuestions(data);
        setExamStarted(true);

        // Initialize matching states
        const mStates = {};
        data.forEach(q => {
          if (q.questionType === 'matching' && q.matchingPairs) {
            mStates[q._id] = q.matchingPairs.map(p => ({ left: p.left, right: '' }));
          }
        });
        setMatchingStates(mStates);

        // Only start countdown after successful fetch
        setLoading(false);
        setShowCountdown(true);
      } catch (error) {
        toast.error('لا توجد أسئلة متاحة حالياً');
        navigate('/dashboard');
      }
    };
    fetchQuestions();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!showCountdown) return;

    // Optional: play an audio tick using the Web Audio API or just a gentle animation
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowCountdown(false);
      setExamStarted(true); // actually start the exam timer
    }
  }, [countdown, showCountdown]);

  // Timer (Stopwatch)
  useEffect(() => {
    if (!examStarted) return;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted]);

  // GSAP on question change
  useEffect(() => {
    if (questions.length > 0) {
      gsap.fromTo('.question-card', { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
  }, [currentIndex, questions.length]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const assignMatchRight = (questionId, leftIndex, rightValue) => {
    setMatchingStates(prev => {
      const newState = { ...prev };
      const pairs = [...(newState[questionId] || [])];
      pairs[leftIndex] = { ...pairs[leftIndex], right: rightValue };
      newState[questionId] = pairs;
      setAnswer(questionId, JSON.stringify(pairs));
      return newState;
    });
  };

  const undoLastMatch = (questionId) => {
    setMatchingStates(prev => {
      const newState = { ...prev };
      const pairs = [...(newState[questionId] || [])];
      for (let i = pairs.length - 1; i >= 0; i--) {
        if (pairs[i].right) {
          pairs[i] = { ...pairs[i], right: '' };
          break;
        }
      }
      newState[questionId] = pairs;
      setAnswer(questionId, JSON.stringify(pairs));
      return newState;
    });
  };

  const resetMatches = (questionId) => {
    setMatchingStates(prev => {
      const newState = { ...prev };
      const pairs = [...(newState[questionId] || [])];
      for (let i = 0; i < pairs.length; i++) {
        pairs[i] = { ...pairs[i], right: '' };
      }
      newState[questionId] = pairs;
      setAnswer(questionId, JSON.stringify(pairs));
      return newState;
    });
  };

  const isQuestionAnswered = (question) => {
    const ans = answers[question._id];
    if (!ans) return false;
    if (question.questionType === 'essay' || question.questionType === 'fill_blank') {
      return ans.trim().length > 0;
    }
    if (question.questionType === 'matching') {
      try {
        const parsed = JSON.parse(ans);
        return parsed.every(p => p.right !== '');
      } catch {
        return false;
      }
    }
    return true; // For multiple choice, true_false
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      let correct = 0;
      let wrong = 0;
      const topicMap = {};
      const answerDetails = [];

      questions.forEach(q => {
        const userAnswer = answers[q._id] || '';
        const topic = q.topic || 'General';

        if (!topicMap[topic]) topicMap[topic] = { correct: 0, total: 0 };
        topicMap[topic].total++;

        let isCorrect = false;
        if (q.questionType === 'essay') {
          isCorrect = userAnswer.trim().length > 0;
        } else if (q.questionType === 'matching') {
          isCorrect = userAnswer === JSON.stringify(q.matchingPairs);
        } else {
          isCorrect = userAnswer.toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim();
        }

        if (isCorrect) {
          correct++;
          topicMap[topic].correct++;
        } else {
          wrong++;
        }

        answerDetails.push({
          questionId: q._id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options || [],
          matchingPairs: q.matchingPairs || [],
          explanation: q.explanation || '',
          userAnswer,
          correctAnswer: q.correctAnswer || '',
          isCorrect
        });
      });

      const total = questions.length;
      const percentage = Math.round((correct / total) * 100);
      const timeSpent = timeElapsed;

      const result = {
        department: user.department,
        score: correct,
        totalQuestions: total,
        correctAnswers: correct,
        wrongAnswers: wrong,
        percentage,
        timeSpent,
        topicBreakdown: Object.entries(topicMap).map(([topic, data]) => ({
          topic,
          correct: data.correct,
          total: data.total
        })),
        answers: answerDetails
      };

      await API.post('/results', result);
      toast.success('تم إرسال الاختبار بنجاح!');
      navigate('/results');
    } catch (error) {
      toast.error('حدث خطأ في إرسال النتيجة');
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions, submitting, user, navigate]);

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  const renderMultipleChoice = () => (
    <div className="space-y-4" dir="ltr">
      {(q.options || []).map((opt, i) => {
        const isSelected = answers[q._id] === opt;
        return (
          <button
            key={i}
            onClick={() => setAnswer(q._id, opt)}
            className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all duration-300 group ${
              isSelected
                ? 'border-primary-500 bg-primary-500/20 text-white shadow-lg shadow-primary-500/20 translate-x-2'
                : 'border-dark-600 bg-dark-800/95 text-dark-100 hover:border-dark-400 hover:bg-dark-700 hover:text-white'
            }`}
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl mr-5 font-bold text-lg shadow-inner transition-colors duration-300 ${
              isSelected ? 'bg-primary-500 text-white' : 'bg-dark-700 text-dark-300 group-hover:bg-dark-600'
            }`}>
              {String.fromCharCode(65 + i)}
            </div>
            <span className="text-lg flex-1 text-left leading-relaxed">{opt}</span>
            {isSelected && <FaCheck className="text-primary-500 ml-4 text-xl" />}
          </button>
        );
      })}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="flex gap-6 mt-8" dir="ltr">
      {['True', 'False'].map((opt) => {
        const isSelected = answers[q._id] === opt;
        const isTrue = opt === 'True';
        const colorClass = isTrue ? 'emerald' : 'red';
        return (
          <button
            key={opt}
            onClick={() => setAnswer(q._id, opt)}
            className={`flex-1 flex flex-col items-center justify-center py-8 rounded-3xl border-2 text-2xl font-bold transition-all duration-300 ${
              isSelected
                ? `border-${colorClass}-500 bg-${colorClass}-500/20 text-${colorClass}-300 shadow-[0_0_30px_rgba(var(--tw-colors-${colorClass}-500),0.2)] scale-105`
                : 'border-dark-600 bg-dark-800/95 text-dark-300 hover:border-dark-400 hover:bg-dark-700/50 hover:text-white'
            }`}
          >
            <span className="mb-2 text-3xl opacity-80">{isTrue ? '👍' : '👎'}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );

  const renderFillBlank = () => (
    <div dir="ltr" className="mt-6">
      <div className="relative group">
        <input
          type="text"
          placeholder="Type your precise answer here..."
          value={answers[q._id] || ''}
          onChange={(e) => setAnswer(q._id, e.target.value)}
          className="w-full bg-dark-900/90 border-2 border-dark-600 rounded-2xl p-6 text-xl text-white outline-none focus:border-primary-500 focus:bg-dark-800 focus:shadow-[0_0_20px_rgba(var(--theme-primary),0.3)] transition-all duration-300 placeholder-dark-500"
        />
        <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-50 group-focus-within:opacity-100 group-focus-within:text-primary-500 transition-opacity">
          ✍️
        </div>
      </div>
    </div>
  );

  const renderMatching = () => {
    const currentState = matchingStates[q._id] || [];
    const pairs = q.matchingPairs || [];
    const usedRights = currentState.map(s => s.right).filter(Boolean);
    const availableRights = pairs.map(p => p.right).filter(r => !usedRights.includes(r));

    return (
      <div className="space-y-6" dir="ltr">
        <div className="flex items-center justify-between mb-4 border-b-2 border-dark-700 pb-4">
          <p className="text-dark-300 text-sm font-medium">Click on a match to assign it to the next empty slot</p>
          <div className="flex gap-2" dir="rtl">
            <button
              onClick={() => undoLastMatch(q._id)}
              disabled={usedRights.length === 0}
              className="px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 transition-colors text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
            >
              تراجع
            </button>
            <button
              onClick={() => resetMatches(q._id)}
              disabled={usedRights.length === 0}
              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
            >
              إعادة التوصيل
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              Items
            </h3>
            {currentState.map((pair, i) => (
              <div key={i} className="p-4 rounded-2xl bg-dark-800/95 border-2 border-dark-600 text-dark-100 shadow-md">
                <span className="font-bold">{pair.left}</span>
                {pair.right && (
                  <span className="text-primary-400 font-bold ml-3 bg-dark-900 px-3 py-1 rounded-lg"> → {pair.right}</span>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-400"></span>
              Matches
            </h3>
            {availableRights.map((right, i) => (
              <button
                key={i}
                onClick={() => {
                  const emptyIndex = currentState.findIndex(s => !s.right);
                  if (emptyIndex !== -1) assignMatchRight(q._id, emptyIndex, right);
                }}
                className="w-full relative overflow-hidden group p-4 rounded-2xl bg-dark-800/95 border-2 border-primary-500/30 text-primary-300 hover:border-primary-500 hover:text-white hover:-translate-y-1 transition-all text-left shadow-[0_4px_15px_rgba(var(--theme-primary),0.1)]"
              >
                <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors"></div>
                <span className="relative z-10 font-bold">{right}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderEssay = () => (
    <div dir="ltr">
      <textarea
        placeholder="Write your answer here..."
        value={answers[q._id] || ''}
        onChange={(e) => setAnswer(q._id, e.target.value)}
        rows={6}
        className="input-field resize-none bg-dark-900/90 text-white text-lg rounded-2xl border-2 border-dark-600 focus:border-primary-500 p-6 shadow-inner w-full outline-none"
      />
    </div>
  );

  const renderQuestion = () => {
    switch (q.questionType) {
      case 'multiple_choice': return renderMultipleChoice();
      case 'true_false': return renderTrueFalse();
      case 'fill_blank': return renderFillBlank();
      case 'matching': return renderMatching();
      case 'essay': return renderEssay();
      default: return null;
    }
  };

  const typeLabels = {
    multiple_choice: 'اختيار من متعدد',
    true_false: 'صح أو خطأ',
    fill_blank: 'أكمل الفراغ',
    matching: 'توصيل',
    essay: 'مقالي'
  };

  return (
    <div ref={pageRef} className="page-container relative min-h-screen">
      {/* ─── COUNTDOWN LAYER ─── */}
      {showCountdown && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-950/90 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-wide animate-slideUp">
              {countdown === 3 ? 'استعد لاختبار كفاءتك' : 
               countdown === 2 ? 'ركّز في كل سؤال' : 
               countdown === 1 ? 'نبدأ العالم الآن' : 'انطلق!'}
            </h1>
            <div 
              key={countdown} 
              className="text-8xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-primary-600 filter drop-shadow-[0_0_30px_rgba(var(--theme-primary),0.8)]"
              style={{ animation: 'pulseRing 1s ease-out forwards' }}
            >
              {countdown === 0 ? 'GO!' : countdown}
            </div>
            
            <div className="mt-12 flex gap-3">
              {[3, 2, 1].map((step) => (
                <div key={step} className={`h-2 rounded-full transition-all duration-500 ${countdown <= step ? 'w-12 bg-primary-500' : 'w-4 bg-dark-700'}`}></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── EXAM LAYER ─── */}
      <div className={`max-w-4xl mx-auto py-8 transition-opacity duration-700 ${showCountdown ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header Summary */}
        <div className="flex flex-wrap items-center justify-between bg-dark-900/80 border border-dark-600/50 p-4 rounded-2xl mb-8 backdrop-blur-md shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-dark-800 font-bold px-4 py-2 rounded-xl text-primary-400 border border-dark-600">
              السؤال {currentIndex + 1} <span className="text-dark-400 font-normal px-2">من</span> {questions.length}
            </div>
            <div className="hidden sm:block text-dark-300 font-medium">
              نوع السؤال: <span className="text-white bg-dark-700 px-3 py-1 rounded-lg mr-2 text-sm border border-dark-600">{typeLabels[q.questionType]}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 transition-colors border-emerald-500/50 bg-emerald-900/10 text-emerald-400">
            <FaClock className="animate-pulse" />
            <span className="font-mono text-xl font-bold tracking-wider">{formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="mb-10 px-2 relative">
          <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden mb-4 shadow-inner">
            <div
              className="h-full bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--theme-primary),0.5)]"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-between w-full h-6 transition-all duration-700">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i > currentIndex) {
                    for (let j = currentIndex; j < i; j++) {
                      if (!isQuestionAnswered(questions[j])) {
                        toast.warning('يجب الإجابة على جميع الأسئلة السابقة أولاً');
                        return;
                      }
                    }
                  }
                  setCurrentIndex(i);
                }}
                className={`flex-1 max-w-[1.5rem] rounded-full mx-auto transition-all duration-300 ${
                  i === currentIndex
                    ? 'h-3 bg-primary-500 shadow-lg shadow-primary-500/40' // Active
                    : answers[questions[i]._id]
                      ? 'h-2 bg-emerald-500 opacity-60 hover:opacity-100 focus:opacity-100 cursor-pointer' // Answered
                      : 'h-1.5 bg-dark-600 hover:bg-dark-500 cursor-pointer opacity-30 hover:opacity-100 hover:h-2' // Unanswered
                }`}
              />
            ))}
          </div>
        </div>

        {/* The Question Area */}
        <div className="question-card bg-dark-900/95 backdrop-blur-xl relative p-8 md:p-12 mb-8 rounded-3xl border-2 border-dark-600 border-t-4 border-t-primary-500 overflow-hidden shadow-2xl">
          {/* Subtle BG Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-3xl rounded-full pointer-events-none"></div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-relaxed font-sans" dir="ltr">
            {q.questionText}
          </h2>
          
          <div className="relative z-10 w-full">
            {renderQuestion()}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pb-10">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary flex items-center gap-3 px-6 py-4 rounded-2xl disabled:opacity-20 hover:-translate-x-1 border-2 border-dark-600 bg-dark-800 hover:bg-dark-700 transition-all text-white"
          >
            <FaArrowRight />
            <span className="font-bold">السؤال السابق</span>
          </button>

          {currentIndex === questions.length - 1 ? (
            <div className="flex flex-col items-center">
              <button
                onClick={handleSubmit}
                disabled={submitting || !isQuestionAnswered(q)}
                className="btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/30 transition-all font-bold text-lg"
              >
                <FaPaperPlane />
                {submitting ? 'جاري الإرسال وتصحيح الإجابات...' : 'إنهاء وإرسال الاختبار'}
              </button>
              {!isQuestionAnswered(q) && (
                <span className="text-red-400 text-sm mt-3 animate-pulse">يجب تأكيد الإجابة لإرسال التقييم النهائي</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={!isQuestionAnswered(q)}
                className="btn-primary flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-primary-600 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed hover:translate-x-1 transition-all font-bold"
              >
                <span>السؤال التالي</span>
                <FaArrowLeft />
              </button>
              {!isQuestionAnswered(q) && (
                <span className="text-red-400 text-xs mt-3 opacity-80">يرجى تسجيل إجابة كشرط للاستمرار</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
