
import React, { useState, useEffect, useCallback } from 'react';
import { NAMES, SEAT_NUMBERS, STORAGE_KEY } from './constants';
import { Participant, Seat, LotteryState } from './types';
import { getSeatFortune } from './services/geminiService';
import { 
  Music, 
  Ticket, 
  Users, 
  RefreshCw, 
  Share2, 
  Sparkles, 
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<LotteryState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      participants: NAMES.map(name => ({ name, hasDrawn: false })),
      availableSeats: [...SEAT_NUMBERS],
      history: []
    };
  });

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastDrawnSeat, setLastDrawnSeat] = useState<{ seat: number; fortune: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleReset = () => {
    if (window.confirm('确定要重置所有抽签数据吗？此操作无法撤销。')) {
      const newState = {
        participants: NAMES.map(name => ({ name, hasDrawn: false })),
        availableSeats: [...SEAT_NUMBERS],
        history: []
      };
      setState(newState);
      setCurrentUser(null);
      setLastDrawnSeat(null);
    }
  };

  const handleDraw = async () => {
    if (!currentUser) return;
    
    const participantIndex = state.participants.findIndex(p => p.name === currentUser);
    if (participantIndex === -1 || state.participants[participantIndex].hasDrawn) {
      setError('你已经抽过签了！');
      return;
    }

    if (state.availableSeats.length === 0) {
      setError('没有可用的座位了。');
      return;
    }

    setIsDrawing(true);
    setError(null);

    // Simulate drawing animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const randomIndex = Math.floor(Math.random() * state.availableSeats.length);
    const seatNumber = state.availableSeats[randomIndex];
    
    // Fetch AI Fortune
    const fortune = await getSeatFortune(currentUser, seatNumber);

    const updatedParticipants = [...state.participants];
    updatedParticipants[participantIndex] = {
      ...updatedParticipants[participantIndex],
      hasDrawn: true,
      assignedSeat: seatNumber,
      fortune: fortune
    };

    const updatedSeats = state.availableSeats.filter(s => s !== seatNumber);
    const updatedHistory = [
      ...state.history,
      { name: currentUser, seat: seatNumber, timestamp: Date.now() }
    ];

    setState({
      participants: updatedParticipants,
      availableSeats: updatedSeats,
      history: updatedHistory
    });

    setLastDrawnSeat({ seat: seatNumber, fortune });
    setIsDrawing(false);
  };

  const shareToWechat = () => {
    alert('请点击右上角 [...] 分享本网页给朋友们开始抽签！');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-md flex flex-col items-center mb-8 pt-8">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20 mb-4 animate-bounce">
          <Music className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
          音乐会座位抽签
        </h1>
        <p className="text-slate-400 text-sm text-center">
          公平、公正、公开的座位分配系统
        </p>
      </header>

      <main className="w-full max-w-md flex-1">
        {/* Step 1: Select Name */}
        {!currentUser && !lastDrawnSeat && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold">请选择你的名字</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {state.participants.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => !p.hasDrawn && setCurrentUser(p.name)}
                    disabled={p.hasDrawn}
                    className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 border ${
                      p.hasDrawn 
                        ? 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed' 
                        : 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-700 active:scale-95'
                    }`}
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.hasDrawn ? (
                      <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-400 uppercase">已抽完</span>
                    ) : (
                      <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-400 uppercase">可抽取</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
              <Ticket className="w-10 h-10 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">共有 {state.availableSeats.length} 个座位待抽取</p>
                <p className="text-xs text-slate-400">目前剩余座位：{state.availableSeats.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Draw Action */}
        {currentUser && !lastDrawnSeat && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30">
              <Sparkles className={`w-10 h-10 text-indigo-400 ${isDrawing ? 'animate-spin' : ''}`} />
            </div>
            <h2 className="text-2xl font-bold mb-2">你好，{currentUser}!</h2>
            <p className="text-slate-400 mb-8">准备好迎接你的幸运数字了吗？点击下方按钮开始抽签。</p>
            
            <button
              onClick={handleDraw}
              disabled={isDrawing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isDrawing ? '正在抽取...' : '立即抽签'}
            </button>
            
            <button 
              onClick={() => setCurrentUser(null)}
              className="mt-4 text-slate-500 text-sm hover:text-slate-300 transition-colors"
            >
              选错了？返回列表
            </button>
          </div>
        )}

        {/* Step 3: Result Display */}
        {lastDrawnSeat && (
          <div className="bg-gradient-to-b from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
            {/* Confetti-like elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <div className="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
              抽签结果
            </div>
            
            <h2 className="text-2xl font-bold mb-1">{currentUser} 的座位是</h2>
            <div className="text-7xl font-serif font-black text-white my-6 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              {lastDrawnSeat.seat}
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 w-full italic text-indigo-200">
              <Sparkles className="w-5 h-5 mb-2 mx-auto text-yellow-400" />
              "{lastDrawnSeat.fortune}"
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setLastDrawnSeat(null);
                  setCurrentUser(null);
                }}
                className="flex-1 bg-slate-800 py-3 rounded-xl font-semibold border border-slate-700 hover:bg-slate-700 transition-all"
              >
                返回首页
              </button>
              <button
                onClick={shareToWechat}
                className="flex-1 bg-indigo-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all"
              >
                <Share2 className="w-4 h-4" />
                分享给朋友
              </button>
            </div>
          </div>
        )}

        {/* Final Board: Summary of Results */}
        {(state.history.length > 0 || state.availableSeats.length === 0) && !lastDrawnSeat && !currentUser && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> 抽签看板
            </h3>
            <div className="space-y-2">
              {state.participants.map(p => (
                <div key={p.name} className="bg-slate-900/40 border border-slate-800/50 p-3 rounded-xl flex items-center justify-between">
                  <span className="font-medium text-slate-300">{p.name}</span>
                  {p.hasDrawn ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 italic">已入座</span>
                      <span className="bg-indigo-500/20 text-indigo-400 font-bold px-3 py-1 rounded-lg border border-indigo-500/30">
                        {p.assignedSeat}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">等待中...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Error Notice */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </main>

      {/* Footer / Controls */}
      <footer className="w-full max-w-md mt-12 pb-8 flex flex-col items-center gap-4">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-slate-600 hover:text-red-400 transition-colors text-xs uppercase font-bold tracking-widest"
        >
          <RefreshCw className="w-3 h-3" />
          重置抽签数据
        </button>
        <p className="text-[10px] text-slate-700">Powered by Gemini AI • 2024 Concert Series</p>
      </footer>

      {/* Persistent Share Button for Mobile */}
      {!lastDrawnSeat && (
        <button 
          onClick={shareToWechat}
          className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-600/40 active:scale-90 transition-transform md:hidden"
        >
          <Share2 className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default App;
