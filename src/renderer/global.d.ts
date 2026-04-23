import type { DesktopApi } from "../shared/data-contract";

declare global {
  interface Window {
    desktop: DesktopApi;
  }
}

export {};
