import { useEffect } from "react";
import { input } from "../input/inputState";

const MOVE_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

const held = { w: false, a: false, s: false, d: false };

function updateAxes() {
  input.moveY = (held.w ? 1 : 0) - (held.s ? 1 : 0);
  input.moveX = (held.d ? 1 : 0) - (held.a ? 1 : 0);
}

export function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (MOVE_KEYS.has(e.code)) e.preventDefault();
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          held.w = true;
          break;
        case "KeyS":
        case "ArrowDown":
          held.s = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          held.a = true;
          break;
        case "KeyD":
        case "ArrowRight":
          held.d = true;
          break;
        case "KeyE":
        case "Space":
          input.interactPressed = true;
          break;
      }
      updateAxes();
    };
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          held.w = false;
          break;
        case "KeyS":
        case "ArrowDown":
          held.s = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          held.a = false;
          break;
        case "KeyD":
        case "ArrowRight":
          held.d = false;
          break;
      }
      updateAxes();
    };
    const blur = () => {
      held.w = held.a = held.s = held.d = false;
      updateAxes();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, []);
}
