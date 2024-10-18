import React from "react";
import NavLinks from "~/components/common/NavLinks";

const HeaderNav: React.FC = () => {
  const navItems = [
    { label: "UserList", path: "/userList" },
    { label: "Chat", path: "/chat" },
    { label: "UserChat", path: "/conversation/user" },
    { label: "GroupChat", path: "/conversation/group" },
  ];

  return (
    <nav className="hidden space-x-4 md:flex">
      <NavLinks items={navItems} />
    </nav>
  );
};

export default HeaderNav;
