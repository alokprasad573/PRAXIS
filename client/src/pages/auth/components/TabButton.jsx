
const TabButton = ({ label, active, onClick }) => {
  return (
    <button
      type="button"
      className={`flex-1 py-3.5 text-lg font-medium transition-colors font-mono cursor-pointer ${
        active ? "tab-active" : "tab-inactive"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default TabButton;
