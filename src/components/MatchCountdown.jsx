import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import UserAvatar from './UserAvatar';

// Web Audio API sound generator
const AudioCtx = window.AudioContext || window.webkitAudioContext;

function playBeep(freq = 440, duration = 0.15, type = 'sine') {
  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

function playStartFanfare() {
  try {
    const ctx = new AudioCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = 0.25;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch (e) { /* silent fail */ }
}

const MatchCountdown = ({ onComplete, player1, player2, difficulty }) => {
  const [phase, setPhase] = useState('rules'); // 'rules' | 'countdown' | 'done'
  const [count, setCount] = useState(3);
  const overlayRef = useRef(null);
  const countRef = useRef(null);
  const rulesRef = useRef(null);

  const difficultyLabels = {
    easy: { ar: 'سهلة', en: 'Easy', color: 'text-emerald-400', bg: 'from-emerald-500 to-emerald-700' },
    medium: { ar: 'متوسطة', en: 'Medium', color: 'text-amber-400', bg: 'from-amber-500 to-amber-700' },
    hard: { ar: 'صعبة', en: 'Hard', color: 'text-red-400', bg: 'from-red-500 to-red-700' },
  };
  const diff = difficultyLabels[difficulty] || difficultyLabels.easy;

  // Rules phase animation
  useEffect(() => {
    if (phase === 'rules' && rulesRef.current) {
      gsap.fromTo(rulesRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' });
      // Auto-move to countdown after 3 seconds
      const timer = setTimeout(() => setPhase('countdown'), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Countdown phase
  useEffect(() => {
    if (phase !== 'countdown') return;

    let currentCount = 3;
    setCount(3);
    playBeep(600, 0.2);

    const interval = setInterval(() => {
      currentCount--;
      if (currentCount > 0) {
        setCount(currentCount);
        playBeep(600 + (3 - currentCount) * 200, 0.2);
      } else {
        clearInterval(interval);
        playStartFanfare();
        setPhase('done');
        setTimeout(() => onComplete(), 600);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  // Countdown number animation
  useEffect(() => {
    if (phase === 'countdown' && countRef.current) {
      gsap.fromTo(countRef.current,
        { scale: 2.5, opacity: 0, rotateZ: -15 },
        { scale: 1, opacity: 1, rotateZ: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
      );
    }
  }, [count, phase]);

  // Done phase
  useEffect(() => {
    if (phase === 'done' && overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.5, delay: 0.3 });
    }
  }, [phase]);

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-950/95 md:backdrop-blur-3xl overflow-hidden">
      
      {/* Dynamic Dramatic Lighting */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-600/10 to-transparent pointer-events-none mix-blend-screen.animate-pulse"></div>
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-600/10 to-transparent pointer-events-none mix-blend-screen animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      {phase === 'rules' && (
        <div ref={rulesRef} className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
          
          {/* EPIC VS Header */}
          <div className="flex flex-row items-center justify-between w-full mb-12 relative gap-4">
            
            {/* Player 1 (Right side in RTL) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/30 blur-2xl rounded-full animate-pulse"></div>
                <UserAvatar user={player1} size="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48" textSize="text-3xl md:text-5xl" className="border-4 border-primary-500 shadow-[0_0_50px_rgba(var(--theme-primary),0.6)] relative z-10" />
              </div>
              <p className="text-white font-black text-xl sm:text-2xl md:text-3xl mt-6 drop-shadow-lg text-center max-w-[200px] truncate">{player1?.fullName}</p>
            </div>

            {/* VS Badge */}
            <div className="shrink-0 flex flex-col items-center justify-center px-4 z-20">
               <div className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-600 drop-shadow-[0_0_30px_#f59e0b] -skew-x-12 transform scale-125">
                 VS
               </div>
               <div className={`mt-6 px-4 py-1 sm:px-6 md:px-8 sm:py-2 md:py-3 rounded-full bg-gradient-to-l ${diff.bg} text-white text-sm sm:text-lg md:text-2xl font-black shadow-lg shadow-black/50 border-2 border-white/20 uppercase tracking-widest whitespace-nowrap`}>
                 {diff.ar}
               </div>
            </div>

            {/* Player 2 (Left side in RTL) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <UserAvatar user={player2} size="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48" textSize="text-3xl md:text-5xl" gradient="from-red-500 to-pink-600" className="border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] relative z-10" />
              </div>
              <p className="text-white font-black text-xl sm:text-2xl md:text-3xl mt-6 drop-shadow-lg text-center max-w-[200px] truncate">{player2?.fullName}</p>
            </div>
          </div>

          {/* Epic Rules Card */}
          <div className="glass-card w-full max-w-3xl p-6 md:p-8 border-t-4 border-amber-500 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50"></div>
            <h3 className="text-2xl md:text-3xl font-black text-amber-400 text-center mb-6 uppercase tracking-wider drop-shadow-md">قواعد المعركة</h3>
            <div className="space-y-4 text-sm md:text-lg">
              <div className="flex items-center gap-4 bg-dark-800/80 p-4 rounded-xl border border-dark-600/50 hover:bg-dark-700 transition">
                <span className="text-amber-500 text-2xl drop-shadow-md">⚡</span>
                <p className="text-gray-200 font-bold">السرعة والدقة هما مفتاح الفوز - أجب بأسرع وقت</p>
              </div>
              <div className="flex items-center gap-4 bg-dark-800/80 p-4 rounded-xl border border-dark-600/50 hover:bg-dark-700 transition">
                <span className="text-red-500 text-2xl drop-shadow-md">⛔</span>
                <p className="text-gray-200 font-bold">الغش أو محاولة التخطي ستسجل كنقطة سوداء تلقائياً</p>
              </div>
              <div className="flex items-center gap-4 bg-dark-800/80 p-4 rounded-xl border border-dark-600/50 hover:bg-dark-700 transition">
                <span className="text-primary-500 text-2xl drop-shadow-md">🎯</span>
                <p className="text-gray-200 font-bold">بمجرد اختيار الإجابة، لا تراجع! ركز جيداً!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="relative z-50 flex flex-col items-center justify-center w-full h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_60%)] pointer-events-none"></div>
          <div
            ref={countRef}
            className="text-[180px] md:text-[250px] font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-yellow-600 leading-none"
            style={{ textShadow: '0 20px 80px rgba(217, 119, 6, 0.8), 0 0 20px rgba(253, 230, 138, 0.5)' }}
          >
            {count}
          </div>
          <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border-[8px] border-amber-500/20 animate-ping pointer-events-none" style={{ animationDuration: '1s' }} />
        </div>
      )}

      {phase === 'done' && (
        <div className="relative z-50 w-full h-full flex items-center justify-center bg-emerald-900/40 md:backdrop-blur-sm">
          <div className="text-8xl md:text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 to-emerald-600 animate-bounce" style={{ textShadow: '0 20px 80px rgba(16, 185, 129, 0.8)'}}>
            انطــلق !
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default MatchCountdown;
