"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavTextAtom } from "~/app/_components/atoms/Text/NavTextAtom";

interface NavLinkItem {
  label: string;
  path: string;
}

interface NavLinksProps {
  items: NavLinkItem[];
}

const NavLinks: React.FC<NavLinksProps> = ({ items }) => {
  const pathname = usePathname();

  const linkClasses = (href: string) => {
    const isActive = pathname === href;
    return isActive
      ? "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-50"
      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50";
  };

  return (
    <>
      {items.map((item) => (
        <Link key={item.path} href={item.path} prefetch={false}>
          <NavTextAtom
            className={`${linkClasses(item.path)} underline-offset-4 hover:underline`}
          >
            {item.label}
          </NavTextAtom>
        </Link>
      ))}
    </>
  );
};

export default NavLinks;
