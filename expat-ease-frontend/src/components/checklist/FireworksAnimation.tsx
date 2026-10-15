import type { FC } from 'react';

const FireworksAnimation: FC = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd3a5'];
  const fireworks = Array.from({ length: 20 }, (_, index) => {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 8 + Math.random() * 12;
    return (
      <div key={index} className="absolute rounded-full opacity-0" style={{
        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
        width: `${size}px`, height: `${size}px`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animation: `firework ${2 + Math.random() * 3}s ease-out forwards`,
        animationDelay: `${Math.random() * 4}s`,
        filter: 'blur(1px)', boxShadow: `0 0 ${size}px ${color}`,
      }} />
    );
  });
  const sparkles = Array.from({ length: 30 }, (_, index) => (
    <div key={`s-${index}`} className="absolute w-1 h-1 bg-white rounded-full opacity-0" style={{
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      animation: `firework-burst ${1 + Math.random() * 2}s ease-out forwards`,
      animationDelay: `${Math.random() * 5}s`,
    }} />
  ));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {fireworks}{sparkles}
      <div className="absolute inset-0 opacity-0" style={{
        background: 'radial-gradient(circle at center, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
        animation: 'celebration-glow 2s ease-in-out infinite, fadeInOut 8s ease-in-out',
      }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
        style={{ animation: 'fadeInOut 8s ease-in-out' }}>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-gradient mb-2">Congratulations!</h2>
          <p className="text-xl text-slate-600">You've completed all settlement steps!</p>
          <p className="text-lg text-slate-500 mt-2">Welcome to your new life abroad! 🌟</p>
        </div>
      </div>
    </div>
  );
};

export default FireworksAnimation;
