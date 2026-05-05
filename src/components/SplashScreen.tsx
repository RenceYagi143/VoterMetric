import { motion } from 'motion/react';
import { Vote } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-sage-100 text-sage-900">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="mb-6 rounded-2xl bg-sage-900 p-4 text-sage-50">
          <Vote size={48} strokeWidth={2.5} />
        </div>
        <h1 className="font-serif text-4xl italic tracking-tight text-sage-900">VoterMetric</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-sage-600">Precision Management System</p>
      </motion.div>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-24 h-[1px] bg-sage-900 opacity-20"
      />
    </div>
  );
}
