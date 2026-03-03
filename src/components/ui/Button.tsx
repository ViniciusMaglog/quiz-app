interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
}

export const Button = ({ children, variant = 'primary', className, ...props }: ButtonProps) => {
  // Mapeamento de cores baseado na identidade visual do projeto
  const variants = {
    primary: "bg-[#025E65] hover:bg-[#034d54]",
    secondary: "bg-[#F37B21] hover:bg-[#d66a1a]",
    success: "bg-green-600 hover:bg-green-700",
    danger: "bg-red-500 hover:bg-red-600",
    ghost: "bg-transparent border border-gray-200 text-gray-400 hover:text-red-500"
  };

  const bgColor = variants[variant];
  const textColor = variant === 'ghost' ? '' : 'text-white';
  
  return (
    <button 
      className={`${bgColor} ${textColor} font-black uppercase text-[10px] py-3 px-6 rounded-xl transition-all active:scale-95 disabled:bg-gray-300 cursor-pointer shadow-sm flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};