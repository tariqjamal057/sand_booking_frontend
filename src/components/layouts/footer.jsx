import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white shadow p-4 text-center text-sm text-gray-600">
      © {new Date().getFullYear()} Dashboard. All rights reserved.
    </footer>
  );
}