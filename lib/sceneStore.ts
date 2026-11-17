import { create } from 'zustand';

/** progress is a float section index (0 = hero ... N-1). Written by GSAP, read by the 3D scene each frame. */
interface SceneState {
  progress: number;
  setProgress: (n: number) => void;
}
export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  setProgress: (n) => set({ progress: n }),
}));
