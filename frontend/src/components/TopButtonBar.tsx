import React from "react";

interface TopButtonBarProps {
  children: React.ReactNode;
}

const TopButtonBar: React.FC<TopButtonBarProps> = ({ children }) => {
  return (
    <div className="w-full bg-white border-b border-gray-200 py-3 px-4 flex flex-wrap gap-3 justify-start items-center sticky top-0 z-10">
      {children}
    </div>
  );
};

export default TopButtonBar;
