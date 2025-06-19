import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
    theme: 'light' | 'dark';
    fontSize: 'sm' | 'md' | 'lg';
    dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY';
    jsonIndentation: number | 'tab';
    toggleTheme: (theme?: 'light' | 'dark') => void;
    setFontSize: (size: 'sm' | 'md' | 'lg') => void;
    setDateFormat: (format: 'YYYY-MM-DD' | 'MM/DD/YYYY') => void;
    setJsonIndentation: (indentation: number | 'tab') => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'dark',
            fontSize: 'md',
            dateFormat: 'YYYY-MM-DD',
            jsonIndentation: 2,
            toggleTheme: (theme) =>
                set((state) => ({
                    theme: theme || (state.theme === 'dark' ? 'light' : 'dark'),
                })),
            setFontSize: (size) => set({ fontSize: size }),
            setDateFormat: (format) => set({ dateFormat: format }),
            setJsonIndentation: (indentation) => set({ jsonIndentation: indentation }),
        }),
        {
            name: 'user-settings', // unique name
            storage: createJSONStorage(() => localStorage), // (optional) by default the 'localStorage' is used
        }
    )
);
