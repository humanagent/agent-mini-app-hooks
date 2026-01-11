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
  const isVerticalScroll = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = null;
    isVerticalScroll.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touchStart.current) return;

      const deltaX = Math.abs(touch.clientX - touchStart.current.x);
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);

      // If vertical movement is greater, this is a scroll, not a swipe
      if (deltaY > deltaX && deltaY > threshold) {
        isVerticalScroll.current = true;
      }

      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [threshold],
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) {
      return;
    }

    // Ignore if this was a vertical scroll
    if (isVerticalScroll.current) {
      touchStart.current = null;
      touchEnd.current = null;
      isVerticalScroll.current = false;
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
      touchStart.current = null;
      touchEnd.current = null;
      isVerticalScroll.current = false;
      return;
    }

    // Only trigger horizontal swipes if horizontal movement is dominant
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
    isVerticalScroll.current = false;
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
