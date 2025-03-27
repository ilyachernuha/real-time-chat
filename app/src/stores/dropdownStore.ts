import { create } from 'zustand';

type DropdownState = {
  openDropdownId: string | null;
  openDropdown: (id: string) => void;
  closeDropdown: () => void;
};

export const useDropdownStore = create<DropdownState>((set) => ({
  openDropdownId: null,
  openDropdown: (id) => set({ openDropdownId: id }),
  closeDropdown: () => set({ openDropdownId: null }),
}));
