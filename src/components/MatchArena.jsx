import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { FaClock, FaCheck, FaTimes, FaUser, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import UserAvatar from './UserAvatar';

// Sound helpers
const AudioCtx = window.AudioContext || window.webkitAudioContext;
function playCorrect() {
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = 880; gain.gain.value = 0.2;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}
function playWrong() {
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = 'square'; osc.frequency.value = 200; gain.gain.value = 0.15;
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

const MatchArena = ({ socket, questions, roomId, currentUser, opponent, difficulty, onMatchEnd }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState({ correct: 0, total: 0 });
  const [myProgress, setMyProgress] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong' }
  const [textInput, setTextInput] = useState(''); // for fill_blank and essay
  const timerRef = useRef(null);
  const arenaRef = useRef(null);

  // Timer counts UP
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data) => {
      const me = data.player1.id === currentUser._id ? data.player1 : data.player2;
      const opp = data.player1.id === currentUser._id ? data.player2 : data.player1;
      setMyProgress({ correct: me.correct, total: me.total });
      setOpponentProgress({ correct: opp.correct, total: opp.total });
    };

    const handlePlayerFinished = (data) => {
      if (data.playerId !== currentUser._id) {
        setOpponentFinished(true);
      }
    };

    const handlePlayerDisconnected = (data) => {
      if (data.playerId !== currentUser._id) {
        import('react-toastify').then(({ toast }) => {
           toast.error('الخصم انسحب أو فقد الاتصال، لقد فزت!');
        });
        setOpponentFinished(true);
      }
    };

    const handleResult = (data) => {
      clearInterval(timerRef.current);
      setMatchResult(data);
      if (onMatchEnd) onMatchEnd(data);
    };

    socket.on('match:progress', handleProgress);
    socket.on('match:playerFinished', handlePlayerFinished);
    socket.on('match:playerDisconnected', handlePlayerDisconnected);
    socket.on('match:result', handleResult);

    return () => {
      socket.off('match:progress', handleProgress);
      socket.off('match:playerFinished', handlePlayerFinished);
      socket.off('match:playerDisconnected', handlePlayerDisconnected);
      socket.off('match:result', handleResult);
    };
  }, [socket, currentUser._id, onMatchEnd]);

  // GSAP on question change + reset text input
  useEffect(() => {
    setTextInput('');
    if (questions.length > 0) {
      gsap.fromTo('.match-question-card', { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    }
  }, [currentIndex, questions.length]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const submitAnswer = useCallback((questionId, answer) => {
    if (answers[questionId] !== undefined || finished) return;

    const q = questions.find(qq => qq._id === questionId);
    let isCorrect = false;

    if (q.questionType === 'essay') {
      isCorrect = answer.trim().length > 0;
    } else if (q.questionType === 'matching') {
      isCorrect = answer === JSON.stringify(q.matchingPairs);
    } else {
      isCorrect = answer.toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim();
    }

    // Sound feedback
    if (isCorrect) { playCorrect(); setFeedback({ type: 'correct' }); }
    else { playWrong(); setFeedback({ type: 'wrong' }); }
    setTimeout(() => setFeedback(null), 800);

    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Emit to server
    socket.emit('match:answer', {
      roomId,
      playerId: currentUser._id,
      questionId,
      answer,
      isCorrect,
    });

    // Auto-advance after 0.6s
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // All questions answered
        handleFinish();
      }
    }, 600);
  }, [answers, finished, questions, socket, roomId, currentUser._id, currentIndex]);

  const handleFinish = useCallback(() => {
    if (finished) return;
    setFinished(true);
    clearInterval(timerRef.current);
    socket.emit('match:finish', {
      roomId,
      playerId: currentUser._id,
      timeSpent: elapsedTime,
    });
  }, [finished, socket, roomId, currentUser._id, elapsedTime]);

  // If result received, parent handles it via onMatchEnd
  if (matchResult) return null;

  const q = questions[currentIndex];
  if (!q) return null;

  const isAnswered = answers[q._id] !== undefined;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;
  const oppProgressPercent = (opponentProgress.total / questions.length) * 100;

  const renderOptions = () => {
    if (q.questionType === 'multiple_choice') {
      return (
        <div className="space-y-3" dir="ltr">
          {(q.options || []).map((opt, i) => (
            <button
              key={i}
              onClick={() => submitAnswer(q._id, opt)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                answers[q._id] === opt
                  ? opt.toLowerCase().trim() === (q.correctAnswer || '').toLowerCase().trim()
                    ? 'border-emerald-500 bg-emerald-500/20 text-white'
                    : 'border-red-500 bg-red-500/20 text-white'
                  : isAnswered
                    ? 'border-dark-700 bg-dark-800/30 text-dark-500 cursor-not-allowed'
                    : 'border-dark-600 bg-dark-800/50 text-dark-200 hover:border-primary-500/50 hover:bg-dark-700/50'
              }`}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-dark-700 text-sm font-bold ml-3">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (q.questionType === 'true_false') {
      return (
        <div className="flex gap-4" dir="ltr">
          {['True', 'False'].map((opt) => (
            <button
              key={opt}
              onClick={() => submitAnswer(q._id, opt)}
              disabled={isAnswered}
              className={`flex-1 p-6 rounded-xl border text-center text-lg font-bold transition-all duration-300 ${
                answers[q._id] === opt
                  ? opt === q.correctAnswer
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-red-500 bg-red-500/20 text-red-400'
                  : isAnswered
                    ? 'border-dark-700 bg-dark-800/30 text-dark-500 cursor-not-allowed'
                    : 'border-dark-600 bg-dark-800/50 text-dark-200 hover:border-primary-500/50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (q.questionType === 'fill_blank') {
      return (
        <div dir="ltr" className="space-y-3">
          <input
            type="text"
            placeholder="Type your answer here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isAnswered}
            className="input-field text-lg"
          />
          {!isAnswered && (
            <button
              onClick={() => submitAnswer(q._id, textInput)}
              disabled={!textInput.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              تأكيد الإجابة
            </button>
          )}
        </div>
      );
    }

    // For essay / matching — simplified for match mode
    if (q.questionType === 'essay') {
      return (
        <div dir="ltr" className="space-y-3">
          <textarea
            placeholder="Write your answer..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isAnswered}
            rows={4}
            className="input-field resize-none"
          />
          {!isAnswered && (
            <button
              onClick={() => submitAnswer(q._id, textInput)}
              disabled={!textInput.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              تأكيد الإجابة
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div ref={arenaRef} className="min-h-screen pt-20 pb-10 px-4 bg-mesh">
      <div className="max-w-3xl mx-auto">
        {/* Top Bar: Players & Timer */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            {/* Player 1 (me) */}
            <div className="flex items-center gap-3">
              <UserAvatar
                user={currentUser}
                size="w-10 h-10"
                textSize="text-sm"
                className="shadow-lg shadow-primary-500/25"
              />
              <div>
                <p className="text-white font-bold text-sm">{currentUser.fullName}</p>
                <p className="text-emerald-400 text-xs font-bold">{myProgress.correct} صحيح</p>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 text-amber-400">
              <FaClock />
              <span className="font-mono font-bold text-lg">{formatTime(elapsedTime)}</span>
            </div>

            {/* Player 2 (opponent) */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-white font-bold text-sm text-left">{opponent.fullName}</p>
                <p className="text-pink-400 text-xs font-bold text-left">
                  {opponentProgress.correct} صحيح
                  {opponentFinished && <span className="text-amber-400 mr-1">(انتهى)</span>}
                </p>
              </div>
              <UserAvatar
                user={opponent}
                size="w-10 h-10"
                textSize="text-sm"
                gradient="from-pink-500 to-red-600"
                className="shadow-lg shadow-pink-500/25"
              />
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary-400 w-8">أنت</span>
              <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-primary-500 to-primary-600 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="text-xs text-dark-400 w-12 text-left">{answeredCount}/{questions.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-pink-400 w-8">خصم</span>
              <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-pink-500 to-red-500 rounded-full transition-all duration-500" style={{ width: `${oppProgressPercent}%` }} />
              </div>
              <span className="text-xs text-dark-400 w-12 text-left">{opponentProgress.total}/{questions.length}</span>
            </div>
          </div>
        </div>

        {/* Answer feedback overlay */}
        {feedback && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-lg font-bold shadow-2xl animate-slideUp ${
            feedback.type === 'correct'
              ? 'bg-emerald-500/90 text-white shadow-emerald-500/30'
              : 'bg-red-500/90 text-white shadow-red-500/30'
          }`}>
            {feedback.type === 'correct' ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة'}
          </div>
        )}

        {/* Finished state */}
        {finished ? (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">أنهيت المباراة!</h2>
            <p className="text-dark-300">في انتظار الخصم لإنهاء المباراة...</p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Question Info */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-dark-400 text-sm">سؤال {currentIndex + 1} من {questions.length}</span>
              <span className="px-3 py-1 rounded-lg bg-dark-700 text-dark-300 text-xs">
                {q.questionType === 'multiple_choice' ? 'اختيار من متعدد' :
                 q.questionType === 'true_false' ? 'صح أو خطأ' :
                 q.questionType === 'fill_blank' ? 'أكمل الفراغ' :
                 q.questionType === 'matching' ? 'توصيل' : 'مقالي'}
              </span>
            </div>

            {/* Question Card */}
            <div className="match-question-card glass-card p-8 mb-6">
              <h2 className="text-xl font-bold text-white mb-6" dir="ltr">{q.questionText}</h2>
              {renderOptions()}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-30"
              >
                <FaArrowRight />
                السابق
              </button>

              {/* Question dots */}
              <div className="hidden md:flex items-center gap-1 flex-wrap justify-center max-w-md">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentIndex ? 'bg-primary-500 scale-125' :
                      answers[questions[i]._id] !== undefined ? 'bg-emerald-500' : 'bg-dark-600'
                    }`}
                  />
                ))}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="btn-primary flex items-center gap-2"
                >
                  التالي
                  <FaArrowLeft />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={answeredCount < questions.length}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  إنهاء المباراة
                  <FaCheck />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MatchArena;
