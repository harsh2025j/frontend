import React from "react";

interface FormFieldProps {
  id?: string;
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  id,
  label, 
  error, 
  required = false, 
  description,
  children,
  className = "" 
}) => {
  return (
    <div id={id} className={`space-y-1.5 group ${className}`}>
      <div className="flex flex-col px-0.5">
        <label className="block text-sm font-semibold text-gray-800 transition-colors group-focus-within:text-[#C9A227]">
          {label} {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {description && !error && (
          <p className="text-[11px] text-gray-400 font-medium leading-tight mt-0.5">
            {description}
          </p>
        )}
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
