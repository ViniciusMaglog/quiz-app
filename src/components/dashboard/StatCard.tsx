interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: 'primary' | 'secondary';
}

export const StatCard = ({ label, value, color = 'primary' }: StatCardProps) => {
  const borderColor = color === 'primary' ? 'border-primary' : 'border-secondary';
  const textColor = color === 'primary' ? 'text-primary' : 'text-secondary';

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-8 ${borderColor} flex flex-col`}>
      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{label}</span>
      <span className={`text-3xl font-black ${textColor}`}>{value}</span>
    </div>
  );
};