import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setDropdownOpen(false);
  };

  const toggleUserDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setMobileMenuOpen(false);
  };

  const userIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-7 h-7"
    >
      <path
        fillRule="evenodd"
        d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.623 18.623 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
        clipRule="evenodd"
      />
    </svg>
  );

  const menuIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );

  const closeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  return (
    <header className="bg-green-600 text-white shadow-lg p-4 flex justify-between items-center relative md:gap-8 gap-3">
      {/* Mobile menu button and main title */}
      <div className="flex items-center">
        <button
          onClick={toggleMobileMenu}
          className="text-white md:hidden p-2 rounded-md"
        >
          {mobileMenuOpen ? closeIcon : menuIcon}
        </button>
        <Link to="/" className="text-lg font-semibold">
          Sand Booking Automation
        </Link>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:flex space-x-6 md:flex-1 md:align-start">
        <Link
          to="/"
          className="hover:text-green-200 transition-colors duration-200"
        >
          Dashboard
        </Link>
        <Link
          to="/profile"
          className="hover:text-green-200 transition-colors duration-200"
        >
          Profile
        </Link>
        <Link
          to="/settings"
          className="hover:text-green-200 transition-colors duration-200"
        >
          Settings
        </Link>
      </nav>

      <div className="relative">
        <button
          onClick={toggleUserDropdown}
          className="flex items-center p-2 rounded-full hover:bg-green-700 transition-colors duration-200"
        >
          {userIcon}
          <span className="ml-2 hidden md:block font-medium">John Doe</span>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white text-gray-800 border rounded-md shadow-lg w-48 z-20">
            <button className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-200 rounded-t-md">
              Profile
            </button>
            <button className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-200">
              Settings
            </button>
            <Link
              to="/login"
              className="block w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-200 rounded-b-md"
            >
              Logout
            </Link>
          </div>
        )}
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <nav className="absolute top-full left-0 w-full bg-green-700 md:hidden z-10 rounded-b-md shadow-lg">
          <Link
            to="/"
            className="block px-4 py-3 text-white hover:bg-green-800 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/master-data"
            className="block px-4 py-3 text-white hover:bg-green-800 transition-colors duration-200"
          >
            Master Data
          </Link>
          <Link
            to="/login"
            className="block px-4 py-3 text-white hover:bg-green-800 transition-colors duration-200"
          >
            Login
          </Link>
        </nav>
      )}
    </header>
  );
}
