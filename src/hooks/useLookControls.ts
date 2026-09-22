import { useEffect, useRef } from "react";
import { input } from "../input/inputState";

/** Desktop click-drag look + mobile touch-drag look, scoped to a DOM element. */
export function useLookControls(targetRef: React.RefObject<HTMLElement | null>) {
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const activeTouchId = useRef<number | null>(null);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // touch handled separately for multi-touch (joystick + look)
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (!dragging.current) return;
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      input.lookDX += dx;
      input.lookDY += dy;
    };
    const onPointerUp = () => {
      dragging.current = false;
    };

    // Touch look: any touch in the right half of the screen that isn't the joystick.
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX > window.innerWidth * 0.42 && activeTouchId.current === null) {
          activeTouchId.current = t.identifier;
          last.current = { x: t.clientX, y: t.clientY };
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === activeTouchId.current) {
          const dx = t.clientX - last.current.x;
          const dy = t.clientY - last.current.y;
          last.current = { x: t.clientX, y: t.clientY };
          input.lookDX += dx * 1.4;
          input.lookDY += dy * 1.4;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === activeTouchId.current) activeTouchId.current = null;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [targetRef]);
}
