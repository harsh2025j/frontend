import { useEffect } from 'react';

export const useDocTitle = (title: string) => {
    useEffect(() => {
        document.title = `${title || "Sajjad Husain Law Associates"}`;
    }, [title]);
};
