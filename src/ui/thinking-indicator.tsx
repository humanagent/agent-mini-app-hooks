import { useState, useEffect } from "react";
import { XIcon } from "./icons";

function AnimatedText({ message }: { message: string }) {
  const [displayLength, setDisplayLength] = useState(0);

  useEffect(() => {
    setDisplayLength(0);
  }, [message]);

  useEffect(() => {
    if (displayLength >= message.length) return;

    const timer = setTimeout(() => {
      setDisplayLength((prev) => prev + 1);
    }, 60);

    return () => clearTimeout(timer);
  }, [displayLength, message.length]);

  return (
    <span className="inline-block">
      {message.split("").map((char, index) => {
        if (index >= displayLength) {
          return null;
        }

        const distance = displayLength - index;
        const wavePosition = distance / 6;
        const wave = Math.cos(wavePosition * Math.PI);
        const opacity = Math.max(
          0.4,
          Math.min(1.0, 0.4 + 0.6 * Math.max(0, wave)),
        );

        return (
          <span
            key={index}
            style={{
              opacity,
              transition: "opacity 300ms ease-out",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
}

export function ThinkingIndicator({
  message,
  error,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <div className="flex w-full items-start gap-2 md:gap-3 justify-start mb-4">
      <div className="flex flex-col gap-2 md:gap-3 max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]">
        <div className="flex items-center gap-2.5">
          {error ? (
            <>
              <XIcon size={14} className="text-destructive shrink-0" />
              <p className="text-xs text-muted-foreground">{message}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              <AnimatedText message={message} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
