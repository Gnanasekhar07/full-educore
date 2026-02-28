import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over clickable elements
            if (
                target.tagName.toLowerCase() === 'button' ||
                target.tagName.toLowerCase() === 'a' ||
                target.closest('button') ||
                target.closest('a') ||
                target.closest('input') ||
                target.closest('select') ||
                target.closest('textarea') ||
                target.classList.contains('cursor-pointer')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            {/* Outer trailing circle */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/40 pointer-events-none z-[9999]"
                animate={{
                    x: mousePosition.x - 16,
                    y: mousePosition.y - 16,
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
            />
            {/* Inner dot */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999]"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                    scale: isHovering ? 0 : 1, // Hide dot when hovering to let the outer circle take over
                }}
                transition={{ type: 'tween', ease: 'linear', duration: 0 }} // Instant follow for the dot
            />
            {/* Glow effect behind the cursor */}
            <motion.div
                className="fixed top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none z-[9998] mix-blend-multiply"
                animate={{
                    x: mousePosition.x - 64,
                    y: mousePosition.y - 64,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
        </>
    );
};

export default CustomCursor;
