export function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null)
    );
  } catch {
    return false;
  }
}
