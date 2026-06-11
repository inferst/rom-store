import { useState, useEffect, useRef } from 'react';

export function useGamepadNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const elementsRef = useRef<HTMLElement[]>([]);
  const lastPressedTime = useRef(0);
  const debounceDelay = 200; // 200ms debounce

  useEffect(() => {
    // Find all focusable elements
    const focusableElements = Array.from(
      document.querySelectorAll<HTMLElement>('button, [tabindex]:not([tabindex="-1"])')
    );
    elementsRef.current = focusableElements;
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const gamepads = navigator.getGamepads();
      if (gamepads.length === 0 || !gamepads[0]) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      
      const gamepad = gamepads[0];
      const now = performance.now();

      if (now - lastPressedTime.current > debounceDelay) {
        // D-pad Down
        if (gamepad.buttons[13].pressed) {
          setFocusedIndex(prev => (prev + 1) % elementsRef.current.length);
          lastPressedTime.current = now;
        }
        // D-pad Up
        else if (gamepad.buttons[12].pressed) {
          setFocusedIndex(prev => (prev - 1 + elementsRef.current.length) % elementsRef.current.length);
          lastPressedTime.current = now;
        }
        // Action button (A/Cross)
        else if (gamepad.buttons[0].pressed) {
          elementsRef.current[focusedIndex]?.click();
          lastPressedTime.current = now;
        }
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Handle gamepad connection/disconnection
    const handleGamepadConnected = (event: GamepadEvent) => {
        console.log('Gamepad connected:', event.gamepad);
    };

    const handleGamepadDisconnected = (event: GamepadEvent) => {
        console.log('Gamepad disconnected:', event.gamepad);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);


    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [focusedIndex]);

  useEffect(() => {
    elementsRef.current.forEach((el, index) => {
        if (index === focusedIndex) {
            el.focus();
        }
    });
  }, [focusedIndex]);
}
