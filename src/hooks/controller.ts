import create from 'zustand';

interface DarkModeState {
    isDarkMode: boolean;
    enableDarkMode: () => void;
    disableDarkMode: () => void;
    toggleDarkMode: () => void;
}

export const useDarkModeStore = create<DarkModeState>((set) => ({
    isDarkMode: false,
    enableDarkMode: () => set({ isDarkMode: true }),
    disableDarkMode: () => set({ isDarkMode: false }),
    toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));