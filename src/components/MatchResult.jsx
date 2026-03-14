import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { FaTrophy, FaRedo, FaHome, FaStar, FaMinus } from 'react-icons/fa';

// Victory sound
const AudioCtx = window.AudioContext || window.webkitAudioContext;
function playVictory() {
  try {
    const ctx = new AudioCtx();
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = 0.2;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
      osc.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  } catch (e) {}
}

function playDefeat() {
  try {
    const ctx = new AudioCtx();
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.4);
      osc.stop(ctx.currentTime + i * 0.2 + 0.5);
    });
  } catch (e) {}
}

const MatchResult = ({ result, currentUserId, onPlayAgain, onGoHome }) => {
  const containerRef = useRef(null);
  const isWinner = result.winnerId === currentUserId;
  const isDraw = result.isDraw;

  const me = result.player1.id === currentUserId ? result.player1 : result.player2;
  const opp = result.player1.id === currentUserId ? result.player2 : result.player1;

  const diffLabels = { easy: 'سهلة', medium: 'متوسطة', hard: 'صعبة' };

  // Play sound & animate
  useEffect(() => {
    if (isDraw) {
      // neutral
    } else if (isWinner) {
      playVictory();
    } else {
      playDefeat();
    }

    if (containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.result-header', { y: -50, opacity: 0, scale: 0.5 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
        gsap.fromTo('.result-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, delay: 0.5, ease: 'power3.out' });
        gsap.fromTo('.result-btn', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, delay: 1.2, ease: 'power2.out' });
      }, containerRef);
      return () => ctx.revert();
    }
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || seconds >= 9999) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="min-h-screen pt-20 pb-10 px-4 bg-mesh flex items-center justify-center">
      <div className="max-w-lg w-full">
        {/* Result Header */}
        <div className="result-header text-center mb-8">
          {isDraw ? (
            <>
              <div className="text-6xl mb-4">🤝</div>
              <h1 className="text-4xl font-black text-amber-400">تعادل!</h1>
              <p className="text-dark-300 mt-2">لم يتفوق أحد</p>
            </>
          ) : isWinner ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-4xl font-black text-emerald-400">فوز!</h1>
              <p className="text-dark-300 mt-2">مبروك، أنت الفائز!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-4xl font-black text-red-400">خسارة</h1>
              <p className="text-dark-300 mt-2">حظ أوفر في المرة القادمة</p>
            </>
          )}
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Me */}
          <div className={`result-card glass-card p-5 text-center ${isWinner ? 'ring-2 ring-emerald-500/50' : ''}`}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto mb-3">
              {me.fullName?.charAt(0)}
            </div>
            <p className="text-white font-bold text-sm mb-1">{me.fullName}</p>
            <p className="text-xs text-dark-400 mb-3">أنت</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">الصحيح:</span>
                <span className="text-emerald-400 font-bold">{me.correct}/{me.total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">الوقت:</span>
                <span className="text-amber-400 font-bold">{formatTime(me.time)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">النقاط:</span>
                <span className={`font-bold ${me.points > 0 ? 'text-emerald-400' : me.points < 0 ? 'text-red-400' : 'text-dark-300'}`}>
                  {me.points > 0 ? `+${me.points}` : me.points}
                </span>
              </div>
            </div>
          </div>

          {/* Opponent */}
          <div className={`result-card glass-card p-5 text-center ${!isWinner && !isDraw ? 'ring-2 ring-red-500/50' : ''}`}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center text-white font-bold text-xl shadow-lg mx-auto mb-3">
              {opp.fullName?.charAt(0)}
            </div>
            <p className="text-white font-bold text-sm mb-1">{opp.fullName}</p>
            <p className="text-xs text-dark-400 mb-3">الخصم</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">الصحيح:</span>
                <span className="text-emerald-400 font-bold">{opp.correct}/{opp.total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">الوقت:</span>
                <span className="text-amber-400 font-bold">{formatTime(opp.time)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">النقاط:</span>
                <span className={`font-bold ${opp.points > 0 ? 'text-emerald-400' : opp.points < 0 ? 'text-red-400' : 'text-dark-300'}`}>
                  {opp.points > 0 ? `+${opp.points}` : opp.points}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="result-card glass-card p-4 mb-6 text-center">
          <p className="text-dark-400 text-sm">
            مباراة <span className="text-white font-bold">{diffLabels[result.difficulty]}</span> — {me.total} سؤال
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="result-btn btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <FaRedo />
            مباراة جديدة
          </button>
          <button
            onClick={onGoHome}
            className="result-btn btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <FaHome />
            الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchResult;
