import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Menu, X, LogOut, Plus, Heart, MessageCircle, Bell, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-400 dark:to-pink-400 bg-clip-text text-transparent">
              Gojo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/listings" 
              className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors duration-200 relative group"
            >
              Browse Properties
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-600 dark:bg-rose-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {user && (
              <>
                {user.role === 'renter' && (
                  <>
                    <Link 
                      to="/saved" 
                      className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-2 transition-colors duration-200"
                    >
                      <Heart className="h-4 w-4" />
                      Saved
                    </Link>
                    <Link 
                      to="/messages" 
                      className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-2 transition-colors duration-200"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Link>
                  </>
                )}
                {user.role === 'agent' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors duration-200"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/messages" 
                      className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-2 transition-colors duration-200"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Link>
                  </>
                )}
                <Link 
                  to="/notifications" 
                  className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-2 transition-colors duration-200"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'agent' && (
                  <Link
                    to="/add-listing"
                    className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Listing</span>
                  </Link>
                )}
                <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <Link
              to="/listings"
              className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Properties
            </Link>
            
            {user && (
              <>
                {user.role === 'renter' && (
                  <>
                    <Link
                      to="/saved"
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Saved Properties
                    </Link>
                  </>
                )}
                {user.role === 'agent' && (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/add-listing"
                      className="block px-4 py-3 text-rose-600 dark:text-rose-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Listing
                    </Link>
                  </>
                )}
                <Link
                  to="/messages"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  to="/notifications"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Notifications
                </Link>
              </>
            )}
            
            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            
            {user ? (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-3">
                  <div className="flex items-center gap-3">
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 space-y-3">
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-4 py-3 text-rose-600 dark:text-rose-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;