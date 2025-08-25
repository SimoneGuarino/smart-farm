import create from 'zustand';

/*interface SidebarState {
    isOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isOpen: false,
    openSidebar: () => set({ isOpen: true }),
    closeSidebar: () => set({ isOpen: false }),
    toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
}));*/

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