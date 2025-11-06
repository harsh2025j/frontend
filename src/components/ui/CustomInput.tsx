import React from "react";
type InputTypes = 
  | "text"
  | "email"
  | "password"
  | "number"
  | "file"
  | "textarea"
  | "select";
interface Option {
  label: string;
  value: string | number;
}
interface InputProps {
  label?: string;
  name: string;
  type?: InputTypes;
  value?: string | number;
  placeholder?: string;
  options?: Option[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}
const CustomInput: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  value,
  placeholder,
  options = [],
  onChange,
  className = "",
  required = false,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={name} className="font-medium">{label}</label>}
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value as string}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={type !== "file" ? value : undefined}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
        />
      )}
    </div>
  );
};

export default CustomInput;
