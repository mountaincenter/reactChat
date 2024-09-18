import React from "react";
import TextAtom from "./TextAtom";

interface NavTextAtomProps {
  children: React.ReactNode;
  className?: string;
}

export const NavTextAtom: React.FC<NavTextAtomProps> = ({
  children,
  className = "", // デフォルト値を設定
  ...props
}) => (
  <TextAtom size="nav" className={className} {...props}>
    {children}
  </TextAtom>
);
