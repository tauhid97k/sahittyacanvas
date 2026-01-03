import { useAppearance } from '@/hooks/use-appearance';

export default function AppLogo() {
    const { appearance } = useAppearance();

    // Compute the actual theme (resolves 'system' to 'light'/'dark')
    const computedTheme =
        appearance === 'system'
            ? typeof window !== 'undefined' &&
              window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            : appearance;

    // Select logo based on computed theme
    const logo =
        computedTheme === 'dark'
            ? '/images/white-logo.png'
            : '/images/logo.png';

    return <img src={logo} className='h-8 sm:h-auto' alt="Sahittyacanvas" key={computedTheme} />;
}
