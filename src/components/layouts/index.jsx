import React, { useState } from "react";
import Header from "./header";
import Footer from "./footer";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 p-4 bg-green-50">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
