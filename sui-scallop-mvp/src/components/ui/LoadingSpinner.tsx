interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export const LoadingSpinner = ({ size = 'md', className = '', variant = 'spinner' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className={`${dotSizeClasses[size]} bg-blue-600 rounded-full animate-pulse-dot`} style={{ animationDelay: '0ms' }} />
        <div className={`${dotSizeClasses[size]} bg-blue-600 rounded-full animate-pulse-dot`} style={{ animationDelay: '200ms' }} />
        <div className={`${dotSizeClasses[size]} bg-blue-600 rounded-full animate-pulse-dot`} style={{ animationDelay: '400ms' }} />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse ${className}`} />
    );
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );
};