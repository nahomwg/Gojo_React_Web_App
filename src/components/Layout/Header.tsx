import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Menu, X, LogOut, Plus, Heart, MessageCircle, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Gojo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/listings" className="text-gray-700 hover:text-primary-600 font-medium">
              Browse Properties
            </Link>
            {user && (
              <>
                {user.role === 'renter' && (
                  <>
                    <Link to="/saved" className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      Saved
                    </Link>
                    <Link to="/messages" className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Link>
                  </>
                )}
                {user.role === 'agent' && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 font-medium">
                      Dashboard
                    </Link>
                    <Link to="/messages" className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Messages
                    </Link>
                  </>
                )}
                <Link to="/notifications" className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'agent' && (
                  <Link
                    to="/add-listing"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Listing</span>
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  {user.photo_url ? (
                    <img
                      src={user.photo_url}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500 capitalize">({user.role})</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <Link
              to="/listings"
              className="block px-3 py-2 text-gray-700 hover:text-primary-600"
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
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600"
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
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/add-listing"
                      className="block px-3 py-2 text-primary-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Add Listing
                    </Link>
                  </>
                )}
                <Link
                  to="/messages"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                <Link
                  to="/notifications"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Notifications
                </Link>
              </>
            )}
            
            {user ? (
              <div className="border-t pt-4">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 text-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t pt-4 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-primary-600 font-medium"
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