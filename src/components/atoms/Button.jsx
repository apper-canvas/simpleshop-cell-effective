import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "default",
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md transform hover:scale-[1.02]",
    secondary: "bg-white text-secondary-600 border border-secondary-300 hover:bg-secondary-50 focus:ring-secondary-500 shadow-sm hover:shadow-md",
    success: "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 focus:ring-success-500 shadow-sm hover:shadow-md transform hover:scale-[1.02]",
    danger: "bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 focus:ring-error-500 shadow-sm hover:shadow-md transform hover:scale-[1.02]",
    ghost: "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:ring-secondary-500"
  };
  
  const sizes = {
    sm: "text-sm px-3 py-2",
    default: "text-sm px-4 py-2.5",
    lg: "text-base px-6 py-3"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;