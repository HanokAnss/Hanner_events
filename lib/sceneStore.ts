import { create } from 'zustand';

/** progress = stage time t (0 … STEPS), written by useStageProgress and read by the 3D scene every frame. */
interface SceneState {
  progress: number;
  ready: boolean; // 3D model mounted
  revealed: boolean; // loader finished, intro dolly-in starts
  setProgress: (n: number) => void;
  setReady: (b: boolean) => void;
  setRevealed: (b: boolean) => void;
}
export const useSceneStore = create<SceneState>((set) => ({
  progress: 0,
  ready: false,
  revealed: false,
  setProgress: (n) => set({ progress: n }),
  setReady: (ready) => set({ ready }),
  setRevealed: (revealed) => set({ revealed }),
}));
