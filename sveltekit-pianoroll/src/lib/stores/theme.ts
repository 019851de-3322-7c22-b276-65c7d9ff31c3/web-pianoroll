import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { ThemeMode } from '../types/index.js';

type Theme = ThemeMode['mode'];

// Default theme preference
const DEFAULT_THEME: Theme = 'system';

/**
 * Create theme store with persistence and system preference detection
 */
function createThemeStore() {
	// Initialize with default or saved preference
	const initialTheme = browser 
		? (localStorage.getItem('theme') as Theme) || DEFAULT_THEME
		: DEFAULT_THEME;

	const { subscribe, set, update } = writable<Theme>(initialTheme);

	/**
	 * Get the effective theme (resolve 'system' to actual preference)
	 */
	function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
		if (theme === 'system' && browser) {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return theme === 'dark' ? 'dark' : 'light';
	}

	/**
	 * Apply theme to document
	 */
	function applyTheme(theme: Theme) {
		if (!browser) return;

		const effectiveTheme = getEffectiveTheme(theme);
		const root = document.documentElement;

		// Update class for Tailwind dark mode
		root.classList.toggle('dark', effectiveTheme === 'dark');
		
		// Update data attribute for CSS custom properties
		root.setAttribute('data-theme', effectiveTheme);
		
		// Update meta theme-color for mobile browsers
		const themeColorMeta = document.querySelector('meta[name="theme-color"]');
		if (themeColorMeta) {
			themeColorMeta.setAttribute('content', 
				effectiveTheme === 'dark' ? '#1a1a1a' : '#ffffff'
			);
		}
	}

	/**
	 * Set theme and persist to localStorage
	 */
	function setTheme(theme: Theme) {
		set(theme);
		applyTheme(theme);
		
		if (browser) {
			localStorage.setItem('theme', theme);
		}
	}

	/**
	 * Toggle between light and dark (skips system)
	 */
	function toggleTheme() {
		update(currentTheme => {
			const newTheme = getEffectiveTheme(currentTheme) === 'dark' ? 'light' : 'dark';
			setTheme(newTheme);
			return newTheme;
		});
	}

	/**
	 * Initialize theme on app startup
	 */
	function initTheme() {
		if (!browser) return;

		// Apply initial theme
		applyTheme(initialTheme);

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleSystemThemeChange = () => {
			update(currentTheme => {
				if (currentTheme === 'system') {
					applyTheme('system');
				}
				return currentTheme;
			});
		};

		// Add listener with both old and new syntax for compatibility
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener('change', handleSystemThemeChange);
		} else {
			// Fallback for older browsers
			mediaQuery.addListener(handleSystemThemeChange);
		}

		// Cleanup function
		return () => {
			if (mediaQuery.removeEventListener) {
				mediaQuery.removeEventListener('change', handleSystemThemeChange);
			} else {
				mediaQuery.removeListener(handleSystemThemeChange);
			}
		};
	}

	return {
		subscribe,
		setTheme,
		toggleTheme,
		initTheme,
		getEffectiveTheme: () => {
			let currentTheme: Theme;
			subscribe(theme => currentTheme = theme)();
			return getEffectiveTheme(currentTheme!);
		}
	};
}

export const theme = createThemeStore();

// Convenience derived store for effective theme
import { derived } from 'svelte/store';

export const effectiveTheme = derived(theme, ($theme) => {
	if ($theme === 'system' && browser) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return $theme === 'dark' ? 'dark' : 'light';
});

// Export theme options for components
export const THEME_OPTIONS: { value: Theme; label: string }[] = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'System' }
];
