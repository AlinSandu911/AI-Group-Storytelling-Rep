import React, { JSX } from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'disabled';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
};

/**
 * Button component that can be styled with different variants
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler function
 * @param {('button'|'submit'|'reset')} props.type - Button type attribute
 * @param {('primary'|'secondary'|'disabled')} props.variant - Visual style variant
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Styled button component
 */
const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  className = '',
}: ButtonProps): JSX.Element => {
  // Base styles
  let buttonClasses = 'px-6 py-2 rounded-md transition duration-300 font-medium ';
  
  // Width style
  buttonClasses += fullWidth ? 'w-full ' : '';
  
  // Variant styles
  if (disabled) {
    buttonClasses += 'bg-gray-300 text-gray-500 cursor-not-allowed ';
  } else {
    switch (variant) {
      case 'primary':
        buttonClasses += 'bg-indigo-700 text-white hover:bg-indigo-800 ';
        break;
      case 'secondary':
        buttonClasses += 'bg-white text-indigo-700 border border-indigo-700 hover:bg-indigo-50 ';
        break;
      default:
        buttonClasses += 'bg-indigo-700 text-white hover:bg-indigo-800 ';
    }
  }
  
  // Add custom classes
  buttonClasses += className;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
};

export default Button;