import React, { JSX } from 'react';

type LoadingSpinnerProps = {
  fullScreen?: boolean;
  message?: string;
};

/**
 * Loading spinner component
 * 
 * @param {Object} props - Component props
 * @param {boolean} [props.fullScreen=false] - Whether to display as a full screen overlay
 * @param {string} [props.message='Loading...'] - Loading message to display
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ 
  fullScreen = false, 
  message = 'Loading...' 
}: LoadingSpinnerProps): JSX.Element => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-700 mb-4"></div>
      {message && <p className="text-indigo-700 font-medium">{message}</p>}
    </div>
  );

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  // Inline spinner
  return (
    <div className="flex items-center justify-center py-12">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;