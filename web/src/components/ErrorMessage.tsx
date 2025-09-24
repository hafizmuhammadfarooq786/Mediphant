interface ErrorMessageProps {
  message: string;
  variant?: 'danger' | 'warning';
  className?: string;
}

export default function ErrorMessage({
  message,
  variant = 'danger',
  className = ''
}: ErrorMessageProps) {
  const variants = {
    danger: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-600'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-600'
    }
  };

  const colors = variants[variant];

  return (
    <div className={`${colors.bgColor} border ${colors.borderColor} ${colors.textColor} px-4 py-3 rounded-md ${className}`}>
      {message}
    </div>
  );
}