export interface InputState {
  moveX: number; // -1..1 (strafe)
  moveY: number; // -1..1 (forward/back)
  lookDX: number; // accumulated look delta since last read, degrees-ish
  lookDY: number;
  interactPressed: boolean; // edge-triggered, consumed each frame
  pointerLocked: boolean;
}

export const input: InputState = {
  moveX: 0,
  moveY: 0,
  lookDX: 0,
  lookDY: 0,
  interactPressed: false,
  pointerLocked: false,
};

export function consumeInteract(): boolean {
  if (input.interactPressed) {
    input.interactPressed = false;
    return true;
  }
  return false;
}

export function consumeLook(): [number, number] {
  const dx = input.lookDX;
  const dy = input.lookDY;
  input.lookDX = 0;
  input.lookDY = 0;
  return [dx, dy];
}
