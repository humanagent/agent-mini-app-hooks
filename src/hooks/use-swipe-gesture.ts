import { useCallback, useRef } from "react";

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  minSwipeDistance?: number;
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 10,
    minSwipeDistance = 50,
  } = options;

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      touchEnd.current = null;
    },
    [],
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) {
      return;
    }

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Require minimum swipe distance and reasonable speed
    if (distance < minSwipeDistance || deltaTime > 300) {
      return;
    }

    // Determine primary direction
    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold,
    minSwipeDistance,
  ]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
