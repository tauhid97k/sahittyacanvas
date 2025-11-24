import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    const savedAppearance =
        (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    // Add the event listener for system theme changes...
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance() {
    // Get initial appearance from localStorage, avoiding synchronous setState in effect
    const getInitialAppearance = (): Appearance => {
        if (typeof window === 'undefined') {
            return 'system';
        }
        return (localStorage.getItem('appearance') as Appearance) || 'system';
    };

    const [appearance, setAppearance] =
        useState<Appearance>(getInitialAppearance);

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);

        // Store in localStorage for client-side persistence...
        localStorage.setItem('appearance', mode);

        // Store in cookie for SSR...
        setCookie('appearance', mode);

        applyTheme(mode);

        // Dispatch custom event for same-page communication
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('appearance-change', { detail: mode }),
            );
        }
    }, []);

    useEffect(() => {
        // Apply theme on mount (don't set state here)
        applyTheme(appearance);

        // Listen for storage changes from other tabs/components
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'appearance' && e.newValue) {
                setAppearance(e.newValue as Appearance);
                applyTheme(e.newValue as Appearance);
            }
        };

        // Listen for custom events from same page
        const handleAppearanceChange = (e: CustomEvent) => {
            setAppearance(e.detail as Appearance);
            applyTheme(e.detail as Appearance);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(
            'appearance-change',
            handleAppearanceChange as EventListener,
        );

        return () => {
            mediaQuery()?.removeEventListener(
                'change',
                handleSystemThemeChange,
            );
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(
                'appearance-change',
                handleAppearanceChange as EventListener,
            );
        };
    }, [appearance]); // Only re-run when appearance changes

    return { appearance, updateAppearance } as const;
}
