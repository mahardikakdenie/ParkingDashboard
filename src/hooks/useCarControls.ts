import { useState, useEffect } from "react";

export interface CarMovement {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

export function useCarControls(): CarMovement {
  const [movement, setMovement] = useState<CarMovement>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) {
        e.preventDefault();
      }
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          setMovement((m) => ({ ...m, forward: true, backward: false }));
          break;
        case "ArrowDown":
        case "KeyS":
          setMovement((m) => ({ ...m, backward: true, forward: false }));
          break;
        case "ArrowLeft":
        case "KeyA":
          setMovement((m) => ({ ...m, left: true, right: false }));
          break;
        case "ArrowRight":
        case "KeyD":
          setMovement((m) => ({ ...m, right: true, left: false }));
          break;
        case "Space":
          setMovement((m) => ({ ...m, brake: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          setMovement((m) => ({ ...m, forward: false }));
          break;
        case "ArrowDown":
        case "KeyS":
          setMovement((m) => ({ ...m, backward: false }));
          break;
        case "ArrowLeft":
        case "KeyA":
          setMovement((m) => ({ ...m, left: false }));
          break;
        case "ArrowRight":
        case "KeyD":
          setMovement((m) => ({ ...m, right: false }));
          break;
        case "Space":
          setMovement((m) => ({ ...m, brake: false }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return movement;
}
