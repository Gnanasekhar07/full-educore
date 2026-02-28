import * as React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

declare module 'react-router-dom';
declare module 'framer-motion';
declare module 'lucide-react';
