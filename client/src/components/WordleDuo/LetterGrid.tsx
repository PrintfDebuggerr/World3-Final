import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LetterStatus } from '../../types/game';
import { useOrientation } from '../../hooks/useOrientation';

interface LetterGridProps {
  letters: string[];
  statuses: LetterStatus[];
  animate?: boolean;
  compact?: boolean;
  enlarged?: boolean;
  interactive?: boolean; // Yeni prop: tıklanabilir mi?
  onLetterClick?: (index: number) => void; // Yeni prop: harf tıklama callback'i
}

export function LetterGrid({ 
  letters, 
  statuses, 
  animate = false, 
  compact = false, 
  enlarged = false,
  interactive = false,
  onLetterClick
}: LetterGridProps) {
  const { isMobile } = useOrientation();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

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

  const handleLetterClick = (index: number) => {
    if (!interactive) return;
    
    setFocusedIndex(index);
    
    // Mobilde kendi klavyesi açılsın ve sürekli açık kalsın
    if (isMobile) {
      // Mevcut scroll pozisyonunu kaydet
      const currentScrollTop = window.scrollY;
      const scrollContainer = document.querySelector('.scroll-container');
      const containerScrollTop = scrollContainer ? scrollContainer.scrollTop : 0;
      
      // Input field oluştur ve focus et
      const input = document.createElement('input');
      input.type = 'text';
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      input.style.opacity = '0';
      input.maxLength = 1;
      
      input.oninput = (e) => {
        const target = e.target as HTMLInputElement;
        const value = target.value.toUpperCase();
        
        if (/^[A-ZÇĞIİÖŞÜ]$/.test(value)) {
          // Harfi ekle
          if (onLetterClick) {
            onLetterClick(index);
          }
          
          // Otomatik olarak bir sonraki kutucuğa geç
          const nextIndex = index + 1;
          if (nextIndex < 5) {
            // Bir sonraki kutucuğa focus ol
            setFocusedIndex(nextIndex);
            
            // Input'u temizle ve yeni kutucuk için hazırla
            target.value = '';
            
            // Kısa bir gecikme ile sonraki kutucuğa geç
            setTimeout(() => {
              if (onLetterClick) {
                onLetterClick(nextIndex);
              }
            }, 100);
          } else {
            // Son kutucuk dolduruldu, input'u kapat
            target.value = '';
            document.body.removeChild(target);
            setFocusedIndex(null);
          }
        }
      };
      
      input.onblur = () => {
        // Klavye kapanmasın, sadece input'u gizle
        if (document.body.contains(input)) {
          input.style.display = 'none';
        }
      };
      
      // Focus olduktan sonra scroll pozisyonunu geri yükle
      input.onfocus = () => {
        // Kısa bir gecikme ile scroll pozisyonunu geri yükle
        setTimeout(() => {
          // Sayfa scroll pozisyonunu geri yükle
          window.scrollTo(0, currentScrollTop);
          
          // Container scroll pozisyonunu geri yükle
          if (scrollContainer) {
            scrollContainer.scrollTop = containerScrollTop;
          }
        }, 50);
      };
      
      document.body.appendChild(input);
      input.focus();
    }
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
          onClick={() => handleLetterClick(index)}
          className={`
            letter-cell ${getSizeClass()} border-2 rounded-md sm:rounded-lg flex items-center justify-center font-bold transition-all duration-200
            ${statuses[index] === 'correct' ? 'correct' : ''}
            ${statuses[index] === 'present' ? 'present' : ''}
            ${statuses[index] === 'absent' ? 'absent' : ''}
            ${statuses[index] === 'empty' ? 'empty' : ''}
            ${isDenizWord ? 'shadow-lg shadow-pink-300' : ''}
            ${interactive ? 'cursor-pointer hover:scale-105 hover:bg-white/10' : ''}
            ${focusedIndex === index ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''}
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
