import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import API from '../api/axios';
import gsap from 'gsap';
import { toast } from 'react-toastify';
import { FaGamepad, FaCircle, FaPaperPlane, FaHistory, FaTrophy, FaFire, FaStar, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

import MatchCountdown from '../components/MatchCountdown';
import MatchArena from '../components/MatchArena';
import MatchResult from '../components/MatchResult';
import UserAvatar from '../components/UserAvatar';

import MoahrebImg from '../assets/Moahreb.png';
import AnthemAudio from '../assets/بسم الله الله اكبر.mp3';

const MatchPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, matchRequest, clearMatchRequest } = useSocket();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const audioRef = useRef(null);

  // States
  const [friends, setFriends] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [myStats, setMyStats] = useState({ points: 0, wins: 0, losses: 0, totalMatches: 0 });
  const [loading, setLoading] = useState(true);

  // Match flow states
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [requestSent, setRequestSent] = useState(false);
  const [requestSentTo, setRequestSentTo] = useState(null);

  // Match phases
  const [matchPhase, setMatchPhase] = useState('lobby'); // lobby | countdown | playing | result
  const [matchData, setMatchData] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  // Manage Anthem audio
  useEffect(() => {
    let audioTimer;
    if (!audioRef.current) {
      audioRef.current = new Audio(AnthemAudio);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    if (matchPhase === 'lobby') {
      audioTimer = setTimeout(() => {
        audioRef.current?.play().catch(e => console.log('Audio autoplay blocked by browser', e));
      }, 3000);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }

    return () => {
      clearTimeout(audioTimer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [matchPhase]);

  // Fetch friends and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsRes, historyRes, statsRes] = await Promise.all([
          API.get('/match/friends'),
          API.get('/match/history'),
          API.get('/match/stats'),
        ]);
        setFriends(friendsRes.data);
        setMatchHistory(historyRes.data);
        setMyStats(statsRes.data);
      } catch (error) {
        console.error('Match data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update online status for friends
  useEffect(() => {
    if (friends.length > 0 && onlineUsers) {
      setFriends(prev => prev.map(f => ({
        ...f,
        isOnline: onlineUsers.includes(f._id || f.id),
      })));
    }
  }, [onlineUsers]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleRequestSent = () => {
      setRequestSent(true);
      toast.success('تم إرسال طلب المباراة!');
    };

    const handleDeclined = () => {
      setRequestSent(false);
      setRequestSentTo(null);
      toast.info('تم رفض طلب المباراة');
    };

    const handleStart = (data) => {
      setMatchData(data);
      setMatchPhase('countdown');
      setRequestSent(false);
      setRequestSentTo(null);
      clearMatchRequest();
    };

    const handleError = (data) => {
      toast.error(data.message);
      setRequestSent(false);
    };

    socket.on('match:requestSent', handleRequestSent);
    socket.on('match:declined', handleDeclined);
    socket.on('match:start', handleStart);
    socket.on('match:error', handleError);

    return () => {
      socket.off('match:requestSent', handleRequestSent);
      socket.off('match:declined', handleDeclined);
      socket.off('match:start', handleStart);
      socket.off('match:error', handleError);
    };
  }, [socket, clearMatchRequest]);

  // Animations
  useEffect(() => {
    if (!loading && matchPhase === 'lobby' && pageRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo('.match-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
        gsap.fromTo('.match-section', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, delay: 0.2, ease: 'power3.out' });
      }, pageRef);
      return () => ctx.revert();
    }
  }, [loading, matchPhase]);

  // Clean up mid-match unmount
  const matchPhaseRef = useRef(matchPhase);
  const matchDataRef = useRef(matchData);
  useEffect(() => { matchPhaseRef.current = matchPhase; }, [matchPhase]);
  useEffect(() => { matchDataRef.current = matchData; }, [matchData]);

  useEffect(() => {
    return () => {
      if (socket && matchDataRef.current && (matchPhaseRef.current === 'countdown' || matchPhaseRef.current === 'playing')) {
        socket.emit('match:quit', { roomId: matchDataRef.current.roomId, playerId: user._id });
      }
    };
  }, [socket, user._id]);

  // Send match request
  const sendMatchRequest = () => {
    if (!selectedFriend || !socket) return;
    socket.emit('match:request', {
      toUserId: selectedFriend._id || selectedFriend.id,
      fromUser: {
        _id: user._id,
        fullName: user.fullName,
        profileImage: user.profileImage,
        department: user.department,
      },
      difficulty,
    });
    setRequestSentTo(selectedFriend);
  };

  // Accept match request
  const acceptRequest = () => {
    if (!matchRequest || !socket) return;
    socket.emit('match:accept', {
      fromUserId: matchRequest.from._id || matchRequest.from.id,
      acceptorUser: {
        _id: user._id,
        fullName: user.fullName,
        profileImage: user.profileImage,
        department: user.department,
      },
    });
  };

  // Decline match request
  const declineRequest = () => {
    if (!matchRequest || !socket || !user) return;
    socket.emit('match:decline', {
      fromUserId: matchRequest.from._id || matchRequest.from.id,
      declinerId: user._id,
    });
    clearMatchRequest();
  };

  // Countdown complete
  const onCountdownComplete = useCallback(() => {
    setMatchPhase('playing');
  }, []);

  // Match end
  const onMatchEnd = useCallback((result) => {
    setMatchResult(result);
    setMatchPhase('result');
  }, []);

  // Play again
  const onPlayAgain = () => {
    setMatchPhase('lobby');
    setMatchData(null);
    setMatchResult(null);
    setSelectedFriend(null);
    // Refresh data
    Promise.all([
      API.get('/match/friends'),
      API.get('/match/history'),
      API.get('/match/stats'),
    ]).then(([f, h, s]) => {
      setFriends(f.data);
      setMatchHistory(h.data);
      setMyStats(s.data);
    }).catch(() => {});
  };

  const difficultyOptions = [
    { value: 'easy', label: 'سهلة', desc: '20 سؤال • الفائز +1 نقطة', color: 'emerald', icon: '⚡' },
    { value: 'medium', label: 'متوسطة', desc: 'نصف الأسئلة • الفائز +2 نقطة', color: 'amber', icon: '🔥' },
    { value: 'hard', label: 'صعبة', desc: 'كل الأسئلة • الفائز +3 نقاط', color: 'red', icon: '💀' },
  ];

  // ─── RENDER PHASES ───

  // Countdown phase
  if (matchPhase === 'countdown' && matchData) {
    const player1 = matchData.player1;
    const player2 = matchData.player2;
    return (
      <MatchCountdown
        onComplete={onCountdownComplete}
        player1={player1}
        player2={player2}
        difficulty={matchData.difficulty}
      />
    );
  }

  // Playing phase
  if (matchPhase === 'playing' && matchData) {
    const currentPlayer = matchData.player1._id === user._id ? matchData.player1 : matchData.player2;
    const opponentPlayer = matchData.player1._id === user._id ? matchData.player2 : matchData.player1;
    return (
      <MatchArena
        socket={socket}
        questions={matchData.questions}
        roomId={matchData.roomId}
        currentUser={{ ...user, _id: user._id }}
        opponent={opponentPlayer}
        difficulty={matchData.difficulty}
        onMatchEnd={onMatchEnd}
      />
    );
  }

  // Result phase
  if (matchPhase === 'result' && matchResult) {
    return (
      <MatchResult
        result={matchResult}
        currentUserId={user._id}
        onPlayAgain={onPlayAgain}
        onGoHome={() => navigate('/dashboard')}
      />
    );
  }

  // ─── LOBBY PHASE ───
  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const onlineFriends = friends.filter(f => f.isOnline);
  const offlineFriends = friends.filter(f => !f.isOnline);

  return (
    <div ref={pageRef} className="page-container bg-mesh relative overflow-hidden">
      
      {/* The global background is explicitly left normal (no huge sun here) */}

      <div className="max-w-5xl mx-auto pt-6 relative z-10">

        {/* Hero Section: Title (Right) + Warrior Image (Left) */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between mb-12 relative w-full bg-dark-800/60 rounded-[3rem] p-6 md:p-12 border border-amber-500/20 shadow-2xl overflow-hidden glass-card">
          
          {/* Confined Sun-like Golden Glow - Extra Bright! Optimized for mobile */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200%] bg-[radial-gradient(ellipse,_rgba(250,204,21,0.3)_0%,_rgba(251,146,60,0.15)_40%,_transparent_80%)] pointer-events-none z-0"></div>

          {/* Text Section (Right side in RTL) */}
          <div className="match-header flex-1 text-center md:text-right relative z-10 mt-8 md:mt-0">
            <h1 className="text-5xl sm:text-7xl lg:text-[5rem] font-black mb-6 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-6 text-transparent bg-clip-text bg-gradient-to-l from-amber-300 via-yellow-400 to-amber-600 drop-shadow-lg leading-tight">
              <FaGamepad className="text-amber-500 text-6xl sm:text-8xl drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]" />
              المباريات
            </h1>
            <p className="text-dark-300 text-lg sm:text-2xl font-bold max-w-lg mx-auto md:mx-0 leading-relaxed">
              تحدَّ أقوى العقول في تخصصك، ادخل حلبة الأبطال وأثبت جدارتك!
            </p>
          </div>

          {/* Dynamic Professional Moahreb Image (Left side in RTL) */}
          <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] flex items-center justify-center shrink-0 z-10">
            
            {/* Outer Spinning Ornaments */}
            <div className="absolute w-[105%] h-[105%] rounded-full border-[2px] border-dashed border-yellow-400/30 animate-[spin_40s_linear_infinite] pointer-events-none"></div>
            
            {/* Massive Glowing Magic Rings */}
            <div className="absolute w-[112%] h-[112%] rounded-full border-t-[4px] border-l-[2px] border-yellow-400 border-b-transparent border-r-transparent animate-[spin_5s_linear_infinite] pointer-events-none opacity-80"></div>
            
            <div className="absolute w-[122%] h-[122%] rounded-full border-b-[6px] border-r-[3px] border-amber-600 border-t-transparent border-l-transparent animate-[spin_7s_linear_reverse_infinite] pointer-events-none opacity-70"></div>
            
            {/* Background Inner Core Glow */}
            <div className="absolute w-full h-full rounded-full bg-yellow-500/20 blur-md pointer-events-none"></div>

            {/* Perfectly Round Image Core - Thinner border */}
            <div className="w-[88%] h-[88%] rounded-full overflow-hidden border-[3px] shadow-[0_0_20px_rgba(251,191,36,0.3)] relative z-10 box-border bg-dark-900 border-[#fbbf24]">
              <img src={MoahrebImg} alt="محارب كابتن تخصص" className="w-full h-full object-cover object-center scale-110" />
              <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] pointer-events-none"></div>
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
            </div>

          </div>
        </div>

        {/* Stats Row */}
        <div className="match-section grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-4 text-center">
            <FaStar className="text-amber-400 text-xl mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{myStats.points}</p>
            <p className="text-dark-400 text-xs">نقاط المباريات</p>
          </div>
          <div className="glass-card p-4 text-center">
            <FaTrophy className="text-emerald-400 text-xl mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-400">{myStats.wins}</p>
            <p className="text-dark-400 text-xs">فوز</p>
          </div>
          <div className="glass-card p-4 text-center">
            <FaTimes className="text-red-400 text-xl mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-400">{myStats.losses}</p>
            <p className="text-dark-400 text-xs">خسارة</p>
          </div>
          <div className="glass-card p-4 text-center">
            <FaFire className="text-amber-400 text-xl mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{myStats.totalMatches}</p>
            <p className="text-dark-400 text-xs">إجمالي المباريات</p>
          </div>
        </div>

        {/* Incoming Match Request */}
        {matchRequest && (
          <div className="match-section glass-card p-6 mb-8 border-2 border-primary-500/50 animate-glow relative overflow-hidden">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-l from-primary-500/10 to-primary-600/10 animate-pulse" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <UserAvatar
                      user={matchRequest.from}
                      size="w-14 h-14"
                      textSize="text-xl"
                      className="shadow-lg shadow-primary-500/30"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">طلب مباراة!</p>
                    <p className="text-dark-300 text-sm">
                      <span className="text-primary-400 font-bold">{matchRequest.from.fullName}</span> يريد التحدي
                      <span className="text-amber-400 mr-1">
                        ({matchRequest.difficulty === 'easy' ? 'سهلة' : matchRequest.difficulty === 'medium' ? 'متوسطة' : 'صعبة'})
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={acceptRequest} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
                    <FaCheck /> قبول
                  </button>
                  <button onClick={declineRequest} className="btn-danger flex items-center gap-2 text-sm py-2 px-5">
                    <FaTimes /> رفض
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Friends List */}
          <div className="lg:col-span-2 match-section">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaCircle className="text-emerald-400 text-xs" />
                أصدقاء القسم ({onlineFriends.length} متصل)
              </h2>

              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dark-400">لا يوجد زملاء في قسمك حالياً</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {/* Online first */}
                  {[...onlineFriends, ...offlineFriends].map((friend) => (
                    <button
                      key={friend._id || friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-right ${
                        (selectedFriend?._id || selectedFriend?.id) === (friend._id || friend.id)
                          ? 'border-primary-500 bg-primary-500/15 shadow-lg shadow-primary-500/10'
                          : 'border-dark-700 bg-dark-800/50 hover:border-primary-500/30 hover:bg-dark-800/80 cursor-pointer'
                      } ${!friend.isOnline ? 'opacity-80' : ''}`}
                    >
                      <div className="relative">
                        <UserAvatar
                          user={friend}
                          size="w-10 h-10"
                          textSize="text-sm"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-800 ${
                          friend.isOnline ? 'bg-emerald-500' : 'bg-dark-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">{friend.fullName}</p>
                        <p className={`text-xs ${friend.isOnline ? 'text-emerald-400' : 'text-dark-500'}`}>
                          {friend.isOnline ? 'متصل الآن' : 'غير متصل'}
                        </p>
                      </div>
                      {(selectedFriend?._id || selectedFriend?.id) === (friend._id || friend.id) && (
                        <FaCheck className="text-primary-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Match Setup */}
          <div className="match-section">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaGamepad className="text-primary-400" />
                إعدادات المباراة
              </h2>

              {/* Difficulty selector */}
              <div className="space-y-3 mb-6">
                <p className="text-dark-300 text-sm font-bold">اختر المستوى:</p>
                {difficultyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDifficulty(opt.value)}
                    className={`w-full p-3 rounded-xl border transition-all duration-300 text-right ${
                      difficulty === opt.value
                        ? `border-${opt.color}-500 bg-${opt.color}-500/15 shadow-md`
                        : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <p className={`font-bold text-sm ${difficulty === opt.value ? `text-${opt.color}-400` : 'text-white'}`}>
                          {opt.label}
                        </p>
                        <p className="text-dark-400 text-xs">{opt.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected friend */}
              {selectedFriend && (
                <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/30 mb-4">
                  <p className="text-dark-300 text-xs mb-1">المنافس المختار:</p>
                  <p className="text-primary-400 font-bold">{selectedFriend.fullName}</p>
                </div>
              )}

              {/* Send Request Button */}
              <button
                onClick={sendMatchRequest}
                disabled={!selectedFriend || requestSent || !socket}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {requestSent ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                    في انتظار القبول...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    إرسال طلب مباراة
                  </>
                )}
              </button>

              {requestSent && requestSentTo && (
                <p className="text-dark-400 text-xs text-center mt-2">
                  تم إرسال الطلب إلى <span className="text-primary-400">{requestSentTo.fullName}</span>
                </p>
              )}
            </div>

            {/* Points Info */}
            <div className="glass-card p-4 mt-4 border-r-4 border-r-amber-400 bg-amber-500/5">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-amber-400 text-sm mt-0.5 flex-shrink-0" />
                <div className="text-xs text-dark-300 space-y-1">
                  <p><span className="text-emerald-400 font-bold">سهلة:</span> الفائز +1 / الخاسر -1</p>
                  <p><span className="text-amber-400 font-bold">متوسطة:</span> الفائز +2 / الخاسر -1</p>
                  <p><span className="text-red-400 font-bold">صعبة:</span> الفائز +3 / الخاسر -1</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match History */}
        {matchHistory.length > 0 && (
          <div className="match-section mt-8">
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaHistory className="text-dark-400" />
                سجل المباريات
              </h2>
              <div className="space-y-2">
                {matchHistory.slice(0, 10).map((m) => {
                  const isP1 = (m.player1Id || m['player1Id']) === user._id;
                  const myCorrect = isP1 ? m.player1Correct : m.player2Correct;
                  const oppCorrect = isP1 ? m.player2Correct : m.player1Correct;
                  const oppName = isP1 ? m.player2Name : m.player1Name;
                  const myPts = isP1 ? m.player1Points : m.player2Points;
                  const won = m.winnerId === user._id;
                  const draw = !m.winnerId;

                  return (
                    <div key={m._id || m.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50 border border-dark-700/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${won ? 'bg-emerald-500' : draw ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-white text-sm font-bold">
                            ضد <span className="text-primary-400">{oppName}</span>
                          </p>
                          <p className="text-dark-400 text-xs">
                            {m.difficulty === 'easy' ? 'سهلة' : m.difficulty === 'medium' ? 'متوسطة' : 'صعبة'} — {myCorrect}/{m.questionCount} vs {oppCorrect}/{m.questionCount}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold text-sm ${myPts > 0 ? 'text-emerald-400' : myPts < 0 ? 'text-red-400' : 'text-dark-400'}`}>
                        {myPts > 0 ? `+${myPts}` : myPts}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPage;
