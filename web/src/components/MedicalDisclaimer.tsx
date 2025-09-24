interface MedicalDisclaimerProps {
  variant?: 'info' | 'warning';
  className?: string;
}

export default function MedicalDisclaimer({
  variant = 'info',
  className = ''
}: MedicalDisclaimerProps) {
  const variants = {
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-700'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-400',
      textColor: 'text-yellow-700'
    }
  };

  const colors = variants[variant];

  return (
    <div className={`${colors.bgColor} border-l-4 ${colors.borderColor} p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${colors.iconColor}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className={`text-sm ${colors.textColor}`}>
            <strong>Important:</strong> This is for informational purposes only and does not constitute medical advice.
            Always consult with a healthcare professional for medical guidance.
          </p>
        </div>
      </div>
    </div>
  );
}