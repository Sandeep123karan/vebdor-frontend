const LabelIcon = ({
  icon,
  label,
  onClick,
  width,
  height,
  printer,
  workerEye,
  disabled,
  ref

}) => (
    <button
    className={
      !printer
        ? "flex items-center gap-4 border-b py-1 px-2 w-full cursor-pointer"
        : "flex items-center gap-4  py-1 px-2 w-full cursor-pointer"
    }
    onClick={onClick}
    disabled={disabled}g
    ref={ref}
  >
    <img
      src={icon}
      alt="Edit"
      className="cursor-pointer"
      width={width || 14}
      height={height}
    />
    {!workerEye && <div className="text-[var(--gray)] text-sm">{label}</div>}
  </button>
  
);

export default LabelIcon;