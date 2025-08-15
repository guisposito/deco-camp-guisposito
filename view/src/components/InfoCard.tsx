import React from "react";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  clickable?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  children,
  className = "",
  icon,
  onClick,
  clickable = false,
}) => {
  const baseClasses =
    "bg-white rounded-lg shadow-md p-6 border border-gray-200";
  const clickableClasses = clickable
    ? "cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    : "";

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (clickable && onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      aria-label={clickable ? title : undefined}
    >
      <div className="flex items-center mb-4">
        {icon && <div className="mr-3 text-blue-600">{icon}</div>}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="text-gray-700">{children}</div>
    </div>
  );
};

export default InfoCard;
