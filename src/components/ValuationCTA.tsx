import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Search, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ValuationCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Know Your Car's{' '}
              <span className="gradient-text">True Value</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Get accurate ₹ INR valuations powered by real-time data from CarWale, Cars24, 
              Spinny & other trusted Indian automotive platforms.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-3 gap-6 mb-10"
          >
            {[
              {
                icon: Search,
                title: 'Number Plate Lookup',
                description: 'Search by Indian registration number',
              },
              {
                icon: BarChart3,
                title: 'Price Analytics',
                description: 'Historical trends and predictions',
              },
              {
                icon: TrendingUp,
                title: 'Indian Market Data',
                description: 'Real-time pricing in ₹ INR',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link to="/valuation">
              <Button size="lg" className="btn-glow text-lg px-8 h-14 gap-2">
                Get Free Valuation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
