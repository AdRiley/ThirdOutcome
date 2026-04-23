import type { DesktopApi } from "../shared/data-contract";

export function createDesktopClient(): DesktopApi {
  return window.desktop;
}
