import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, BarChart3, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const slides = [
  {
    title: "Track with Precision",
    description: "Manage voter lists and precincts with a surgical level of detail and accuracy.",
    icon: <Map className="h-12 w-12" />,
    color: "bg-blue-500"
  },
  {
    title: "Real-Time Analytics",
    description: "Watch data come to life with live updates and predictive political affiliation charts.",
    icon: <BarChart3 className="h-12 w-12" />,
    color: "bg-emerald-500"
  },
  {
    title: "Secure & Accessible",
    description: "Your data is protected by enterprise-grade encryption and granular access controls.",
    icon: <ShieldCheck className="h-12 w-12" />,
    color: "bg-amber-500"
  }
];

export default function Onboarding({ onComplete }: Props) {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current === slides.length - 1) {
      onComplete();
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-sage-100 font-sans text-sage-900">
      <div className="flex flex-1 items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex max-w-md flex-col items-center text-center"
          >
            <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-3xl ${slides[current].color} text-white shadow-xl bg-opacity-90 backdrop-blur-sm`}>
              {slides[current].icon}
            </div>
            <h2 className="font-serif text-3xl font-bold italic text-sage-900">{slides[current].title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-sage-800 opacity-80">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-sage-900/10 p-8">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button 
            onClick={onComplete}
            className="text-sm font-medium uppercase tracking-wider text-sage-600 hover:text-sage-900 transition-colors"
          >
            Skip to Login
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-sage-900' : 'w-2 bg-sage-900/20'}`} 
              />
            ))}
          </div>

          <button 
            onClick={next}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-sage-900 text-sage-50 transition-transform hover:scale-110 active:scale-95 shadow-lg shadow-sage-900/20"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
