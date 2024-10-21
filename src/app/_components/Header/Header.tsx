import Link from "next/link";
import HeaderNav from "./HeaderNav";
import UserSection from "./UserSection";

const Header: React.FC = () => {
  return (
    <header className="fixed left-0 top-0 z-10 flex w-full items-center justify-between bg-background px-4 py-3 shadow-sm md:px-6">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <span className="text-lg font-semibold">Acme Inc</span>
      </Link>
      <HeaderNav />
      <div>
        <UserSection />
      </div>
    </header>
  );
};

export default Header;
