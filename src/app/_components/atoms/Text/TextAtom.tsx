import React from "react";

interface TextAtomProps {
  children: React.ReactNode;
  size: "small" | "medium" | "large" | "title" | "nav";
  className?: string;
}

const sizeClasses = {
  small: "text-xl sm:text-xl md:text-2xl lg:text-4xl xl:text-4xl",
  medium: "text-3xl sm:text-4xl md:text-5xl lg:text-8xl xl:text-8xl",
  large: "text-5xl sm:text-8xl md:text-8xl lg:text-10xl xl:text-10xl",
  title: "text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl",
  nav: "text-md sm:text-lg md:text-xl lg:text-xl xl:text-xl",
};

const TextAtom: React.FC<TextAtomProps> = ({
  children,
  size,
  className = "", // デフォルト値を設定
  ...props
}) => (
  <div
    className={`text-center font-bold text-black dark:text-white ${sizeClasses[size]} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default TextAtom;
