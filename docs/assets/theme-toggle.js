(function () {
  const storageKey = 'windform-docs-theme';
  const root = document.querySelector('[data-site-root]');
  const toggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));

  if (!root || toggles.length === 0) {
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const readStoredTheme = () => {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  };

  const storeTheme = (theme) => {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      /* noop */
    }
  };

  const updateToggleVisuals = (theme) => {
    toggles.forEach((toggle) => {
      toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      toggle.setAttribute('data-theme-state', theme);

      const sun = toggle.querySelector('[data-theme-icon="light"]');
      const moon = toggle.querySelector('[data-theme-icon="dark"]');

      if (sun) {
        sun.classList.toggle('hidden', theme === 'dark');
      }

      if (moon) {
        moon.classList.toggle('hidden', theme === 'light');
      }
    });
  };

  const applyTheme = (theme, { remember = false } = {}) => {
    const isDark = theme === 'dark';

    root.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', isDark);
    root.classList.toggle('dark', isDark);
    document.documentElement.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
    updateToggleVisuals(theme);

    if (remember) {
      storeTheme(theme);
    }
  };

  const getPreferredTheme = () => {
    const stored = readStoredTheme();

    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return prefersDark.matches ? 'dark' : 'light';
  };

  applyTheme(getPreferredTheme());

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next, { remember: true });
    });
  });

  if (typeof prefersDark.addEventListener === 'function') {
    prefersDark.addEventListener('change', (event) => {
      if (readStoredTheme()) {
        return;
      }

      applyTheme(event.matches ? 'dark' : 'light');
    });
  }
})();
