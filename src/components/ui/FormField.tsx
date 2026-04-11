import React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  required = false, 
  children,
  className = "" 
}) => {
  return (
    <div className={`space-y-1.5 group ${className}`}>
      <div className="flex justify-between items-center px-0.5">
        <label className="block text-sm font-medium text-gray-700 transition-colors group-focus-within:text-[#C9A227]">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>
      
      <div className="relative">
        {children}
      </div>

      <div className="min-h-[1.25rem] px-0.5 overflow-hidden">
        {error ? (
          <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default FormField;
