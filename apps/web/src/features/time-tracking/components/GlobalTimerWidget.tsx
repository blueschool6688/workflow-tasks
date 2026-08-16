'use client';

import * as React from 'react';
import { Play, Pause, Stop, Clock } from '@phosphor-icons/react';

export function GlobalTimerWidget() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const [taskKey] = React.useState('PROJ-101');

  React.useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 p-3 rounded-xl bg-zinc-900 text-white shadow-2xl border border-zinc-800 flex items-center gap-3 text-xs font-mono">
      <div className="flex items-center gap-2">
        <Clock size={16} className={isRunning ? 'text-accent-400 animate-pulse' : 'text-zinc-400'} />
        <span className="font-bold text-accent-400">{taskKey}</span>
        <span className="text-zinc-200 font-bold">{formatTime(seconds)}</span>
      </div>

      <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-white"
          title={isRunning ? 'Tạm dừng' : 'Bắt đầu'}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setSeconds(0);
          }}
          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-red-400"
          title="Dừng và lưu log"
        >
          <Stop size={14} />
        </button>
      </div>
    </div>
  );
}
