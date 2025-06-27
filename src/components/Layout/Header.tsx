import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, Menu, X, LogOut, Plus, Heart, MessageCircle, Bell, Moon, Sun, Search, Globe } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import AuthModal from '../Auth/AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
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

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
              <div className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="flex-1 px-6 py-3">
                    <input
                      type="text"
                      placeholder="Search destinations"
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="border-l border-gray-300 dark:border-gray-600 px-6 py-3">
                    <input
                      type="text"
                      placeholder="Check in"
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <div className="border-l border-gray-300 dark:border-gray-600 px-6 py-3">
                    <input
                      type="text"
                      placeholder="Guests"
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                  <button className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-full m-2 transition-colors duration-200">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Host Your Property */}
              {user && user.role === 'agent' ? (
                <Link
                  to="/add-listing"
                  className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Gojo your home
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal('signup')}
                  className="text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Gojo your home
                </button>
              )}

              {/* Language/Region */}
              <button className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200">
                <Globe className="h-4 w-4" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.role === 'renter' && (
                    <>
                      <Link
                        to="/saved"
                        className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                      >
                        <Heart className="h-4 w-4" />
                      </Link>
                      <Link
                        to="/messages"
                        className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Link>
                    </>
                  )}
                  
                  <Link
                    to="/notifications"
                    className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                  >
                    <Bell className="h-4 w-4" />
                  </Link>

                  <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 hover:shadow-md transition-shadow duration-200">
                    <button className="p-2">
                      <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
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
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-2 py-1 hover:shadow-md transition-shadow duration-200">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 font-medium"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-colors duration-200 font-medium"
                  >
                    Sign up
                  </button>
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
              {/* Mobile Search */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
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

                  {user.role === 'agent' && (
                    <Link
                      to="/add-listing"
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Property
                    </Link>
                  )}

                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

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
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      openAuthModal('login');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 text-left"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('signup');
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all duration-200 text-left"
                  >
                    Sign up
                  </button>
                </div>
              )}

              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />
    </>
  );
};

export default Header;