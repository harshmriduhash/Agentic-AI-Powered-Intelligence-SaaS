/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, UserMinus, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleUnsubscribe = async () => {
    if (window.confirm('Are you absolutely sure? This will delete your account and all your data forever.')) {
      try {
        const { eventsAPI } = await import('../../api/client');
        const userId = user?._id || user?.id;
        await eventsAPI.deleteAccount(userId);
        logout();
        navigate('/');
      } catch (error) {
        console.error('Failed to unsubscribe:', error);
        alert('Failed to delete account. Please try again later.');
      }
    }
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showMenu]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold gradient-text"
          >
            Contexta AI
          </motion.div>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
                {user?.isOnboarded && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/dashboard')}
                      className="hidden md:flex text-white hover:bg-white/10 border-white/20"
                    >
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/settings')}
                      className="hidden md:flex text-white hover:bg-white/10 border-white/20"
                    >
                      Edit Preferences
                    </Button>
                  </div>
                )}
              
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm text-white">{user?.email}</span>
                </motion.button>

                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-xl p-2"
                  >
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setShowMenu(false);
                      }}
                      className="md:hidden w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 rounded-md transition-colors text-white"
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        handleUnsubscribe();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/20 rounded-md transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      Unsubscribe
                    </button>
                    <div className="h-px bg-white/10 my-2" />
                    <button
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-white hover:bg-white/10 border-white/20"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}