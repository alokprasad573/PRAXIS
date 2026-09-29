
const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  placeholder,
  required = false,
  children, // for extra elements like password toggle button
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-mono uppercase tracking-wider text-[#d6c5a8] mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field block w-full ${
            icon ? "pl-10" : "pl-3"
          } ${children ? "pr-10" : "pr-3"} py-2.5 text-sm rounded-lg font-mono text-cream-100`}
        />
        {children}
      </div>
    </div>
  );
};

export default InputField;
