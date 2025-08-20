import React from 'react';
import { motion } from 'framer-motion';
import { LetterStatus } from '../../types/game';

interface LetterGridProps {
  letters: string[];
  statuses: LetterStatus[];
  animate?: boolean;
}

export function LetterGrid({ letters, statuses, animate = false }: LetterGridProps) {
  return (
    <div className="flex justify-center space-x-2">
      {letters.map((letter, index) => (
        <motion.div
          key={index}
          initial={animate ? { rotateX: 0 } : false}
          animate={animate ? { rotateX: [0, 90, 0] } : false}
          transition={animate ? { 
            duration: 0.6, 
            delay: index * 0.1,
            ease: "easeInOut"
          } : undefined}
          className={`
            letter-cell w-14 h-14 border-2 rounded-lg flex items-center justify-center
            text-2xl font-bold transition-all duration-200
            ${statuses[index] === 'correct' ? 'correct' : ''}
            ${statuses[index] === 'present' ? 'present' : ''}
            ${statuses[index] === 'absent' ? 'absent' : ''}
            ${statuses[index] === 'empty' ? 'empty' : ''}
          `}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.span
            initial={animate ? { opacity: 1 } : false}
            animate={animate ? { 
              opacity: [1, 0, 1],
            } : false}
            transition={animate ? { 
              duration: 0.6, 
              delay: index * 0.1,
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
