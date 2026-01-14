/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-transparent via-slate-900/50 to-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-4">Contexta AI</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your personalized tech intelligence platform powered by AI. Stay informed without the overwhelm.
            </p>
            <div className="mt-6 flex gap-4">
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, y: -2 }}
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-white text-lg">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#features" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">How it Works</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-white text-lg">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#about" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">About</a></li>
              <li><a href="#blog" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">Blog</a></li>
              <li><a href="#careers" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">Careers</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-6 text-white text-lg">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#help" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">Help Center</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">Contact Us</a></li>
              <li><a href="#privacy" className="text-gray-400 hover:text-primary transition-colors hover:translate-x-1 inline-block">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; 2025 Contexta AI. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#terms" className="hover:text-primary transition-colors">Terms</a>
              <a href="#privacy" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#cookies" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </footer>
  );
}