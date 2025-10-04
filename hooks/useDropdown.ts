
import { useState, useEffect, useRef } from 'react';

export const useDropdown = <T extends HTMLElement,>() => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<T>(null);

    const toggle = () => setIsOpen(prev => !prev);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return { ref, isOpen, setIsOpen, toggle };
};
