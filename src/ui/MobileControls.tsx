import { useEffect, useRef, useState } from "react";
import { input } from "../input/inputState";
import { useStore } from "../store/useStore";
import { PLACES } from "../data/places";

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

const JOYSTICK_RADIUS = 44;

export function MobileControls() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const nearbyPlace = useStore((s) => s.nearbyPlace);
  const openPanel = useStore((s) => s.openPanel);
  const markVisited = useStore((s) => s.markVisited);

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const setKnob = (dx: number, dy: number) => {
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const onStart = (e: TouchEvent) => {
      if (touchId.current !== null) return;
      const t = e.changedTouches[0];
      touchId.current = t.identifier;
      const rect = base.getBoundingClientRect();
      origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      setActive(true);
    };
    const onMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== touchId.current) continue;
        let dx = t.clientX - origin.current.x;
        let dy = t.clientY - origin.current.y;
        const len = Math.hypot(dx, dy);
        if (len > JOYSTICK_RADIUS) {
          dx = (dx / len) * JOYSTICK_RADIUS;
          dy = (dy / len) * JOYSTICK_RADIUS;
        }
        setKnob(dx, dy);
        input.moveX = dx / JOYSTICK_RADIUS;
        input.moveY = -dy / JOYSTICK_RADIUS;
      }
    };
    const onEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== touchId.current) continue;
        touchId.current = null;
        setActive(false);
        setKnob(0, 0);
        input.moveX = 0;
        input.moveY = 0;
      }
    };

    base.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      base.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const nearbyName = nearbyPlace ? PLACES.find((p) => p.id === nearbyPlace)?.name : null;

  return (
    <>
      <div
        ref={baseRef}
        className={`joystick-base${active ? " active" : ""}`}
        aria-hidden="true"
      >
        <div ref={knobRef} className="joystick-knob" />
      </div>
      {nearbyPlace && (
        <button
          className="interact-button"
          onTouchStart={(e) => {
            e.preventDefault();
            openPanel(nearbyPlace);
            markVisited(nearbyPlace);
          }}
        >
          Tap to view
          <span>{nearbyName}</span>
        </button>
      )}
    </>
  );
}
