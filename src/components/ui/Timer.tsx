"use client";

interface TimerProps {
  seconds: number;
  totalSeconds: number;
}

export const Timer = ({ seconds, totalSeconds }: TimerProps) => {
  const percentage = (seconds / totalSeconds) * 100;
  const color = seconds < 10 ? 'text-red-500' : 'text-secondary';

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={226}
          strokeDashoffset={226 - (226 * percentage) / 100}
          className={`${color} transition-all duration-1000 ease-linear`}
        />
      </svg>
      <span className={`absolute text-xl font-bold ${color}`}>
        {seconds}
      </span>
    </div>
  );
};