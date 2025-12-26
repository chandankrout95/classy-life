"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.95 }} // Increased start scale for less travel
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, // Higher stiffness = faster movement
          damping: 30,    // Higher damping = less oscillation/bounce
          mass: 0.8,      // Lower mass = moves lighter/faster
        }}
        className="w-full min-h-screen bg-background overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}