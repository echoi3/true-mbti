import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-indigo-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/">TrueMBTI</Link>
        </h1>
      </div>
    </header>
  );
}

export default Header;