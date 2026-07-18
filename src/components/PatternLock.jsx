import React, { useState, useRef, useEffect, useCallback } from 'react';

const PatternLock = ({ onComplete }) => {
  const [pattern, setPattern] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef(null);

  const resetPattern = () => {
    setPattern([]);
    setIsDrawing(false);
  };

  const getDotFromEvent = (e) => {
    let clientX, clientY;
    
    // Support touch and mouse
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const element = document.elementFromPoint(clientX, clientY);
    if (element && element.dataset.index !== undefined) {
      return parseInt(element.dataset.index, 10);
    }
    return null;
  };

  const handlePointerDown = (e) => {
    const dotIndex = getDotFromEvent(e);
    if (dotIndex !== null) {
      setIsDrawing(true);
      setPattern([dotIndex]);
    }
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing) return;
    
    const dotIndex = getDotFromEvent(e);
    if (dotIndex !== null && !pattern.includes(dotIndex)) {
      setPattern(prev => [...prev, dotIndex]);
    }
  }, [isDrawing, pattern]);

  const handlePointerUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      if (pattern.length > 0) {
        onComplete(pattern);
        setTimeout(resetPattern, 500); // Reset after delay for visual feedback
      }
    }
  }, [isDrawing, pattern, onComplete]);

  // Global event listeners for moving and releasing
  useEffect(() => {
    if (isDrawing) {
      // Prevent default touch actions like scrolling while drawing
      const preventDefault = (e) => e.preventDefault();
      document.addEventListener('touchmove', preventDefault, { passive: false });
      
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchend', handlePointerUp);

      return () => {
        document.removeEventListener('touchmove', preventDefault);
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isDrawing, handlePointerMove, handlePointerUp]);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        padding: '20px',
        touchAction: 'none',
        userSelect: 'none'
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
        const isActive = pattern.includes(i);
        return (
          <div 
            key={i}
            data-index={i}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: isActive ? 'var(--primary)' : 'var(--border-color)',
              margin: 'auto',
              transition: 'all 0.2s ease',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
              boxShadow: isActive ? '0 0 10px var(--primary)' : 'none',
              cursor: 'pointer',
              zIndex: 10
            }}
          />
        );
      })}
    </div>
  );
};

export default PatternLock;
