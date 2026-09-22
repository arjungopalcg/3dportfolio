import type { Object3D } from "three";

export const collidableMeshes: Object3D[] = [];

export function registerCollidable(obj: Object3D) {
  if (!collidableMeshes.includes(obj)) collidableMeshes.push(obj);
}

export function unregisterCollidable(obj: Object3D) {
  const idx = collidableMeshes.indexOf(obj);
  if (idx !== -1) collidableMeshes.splice(idx, 1);
}
