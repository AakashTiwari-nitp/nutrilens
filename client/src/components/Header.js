"use client";
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <div className="flex items-center justify-between mb-8 gap-4">
      <SearchBar />
      <ThemeToggle />
    </div>
  );
};

export default Header;
