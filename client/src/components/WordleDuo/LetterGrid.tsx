import React from 'react';
import { motion } from 'framer-motion';
import { LetterStatus } from '../../types/game';

interface LetterGridProps {
  letters: string[];
  statuses: LetterStatus[];
  animate?: boolean;
  compact?: boolean;
  enlarged?: boolean;
}

export function LetterGrid({ letters, statuses, animate = false, compact = false, enlarged = false }: LetterGridProps) {
  // Check if this is the special "DENİZ" word
  const isDenizWord = letters.join('') === 'DENİZ' && animate;
  
  // Determine size classes based on props
  const getSpacingClass = () => {
    if (compact) return "flex justify-center space-x-0.5";
    if (enlarged) return "flex justify-center space-x-0.5"; // Minimal aralık
    return "flex justify-center space-x-1 sm:space-x-2";
  };

  const getSizeClass = () => {
    if (compact) return 'w-8 h-8 text-sm';
    if (enlarged) return 'w-10 h-10 text-base'; // Daha küçük ama okunabilir
    return 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-lg sm:text-xl md:text-2xl';
  };

  return (
    <div className={getSpacingClass()}>
      {letters.map((letter, index) => (
        <motion.div
          key={index}
          initial={animate ? { rotateX: 0, scale: 1 } : false}
          animate={animate ? { 
            rotateX: isDenizWord ? [0, 360, 0] : [0, 90, 0],
            scale: isDenizWord ? [1, 1.2, 1] : 1,
            y: isDenizWord ? [0, -10, 0] : 0
          } : false}
          transition={animate ? { 
            duration: isDenizWord ? 1.2 : 0.6, 
            delay: index * (isDenizWord ? 0.2 : 0.1),
            ease: "easeInOut"
          } : undefined}
          className={`
            letter-cell ${getSizeClass()} border-2 rounded-md sm:rounded-lg flex items-center justify-center font-bold transition-all duration-200
            ${statuses[index] === 'correct' ? 'correct' : ''}
            ${statuses[index] === 'present' ? 'present' : ''}
            ${statuses[index] === 'absent' ? 'absent' : ''}
            ${statuses[index] === 'empty' ? 'empty' : ''}
            ${isDenizWord ? 'shadow-lg shadow-pink-300' : ''}
          `}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
                           <motion.span
                   initial={animate ? { opacity: 1, scale: 1 } : false}
                   animate={animate ? {
                     opacity: [1, 0, 1],
                     scale: isDenizWord ? [1, 1.3, 1] : 1,
                     rotate: isDenizWord ? [0, 10, -10, 0] : 0
                   } : false}
                   transition={animate ? {
                     duration: isDenizWord ? 1.2 : 0.6,
                     delay: index * (isDenizWord ? 0.2 : 0.1),
                     times: [0, 0.5, 1]
                   } : undefined}
                 >
            {letter === ' ' ? '' : letter}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}
