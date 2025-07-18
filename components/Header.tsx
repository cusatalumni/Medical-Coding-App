
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
<div className="container mx-auto px-4 py-3 flex justify-between items-center">
  <a
    href="https://www.coding-online.net"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-3"
  >
    <img
      src="https://www.coding-online.net/wp-content/uploads/2019/01/cropped-coding-logo-vectorised-150x150-1.png"
      alt="Medical Coding Online Logo"
      width={50}
      height={50}
    />
    <div className="flex flex-col">
      <span className="text-3xl font-bold text-slate-900 font-serif">
        Medical Coding Online
      </span>
      <span className="text-md text-slate-500 font-serif">
        www.coding-online.net
      </span>
    </div>
  </a>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2 text-slate-600">
                <UserCircle size={20} />
                <span className="hidden sm:inline">Welcome, {user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <span className="text-slate-600 font-medium">Your Partner in Certification</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
