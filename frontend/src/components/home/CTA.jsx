/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            Ready to Get <span className="gradient-text">Started</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers staying ahead of the curve
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/signup')}
            className="text-lg px-8 group"
          >
            Start Your Experience
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}