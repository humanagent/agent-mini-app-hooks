import { XIcon } from "./icons";

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span
        className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
        style={{ animationDelay: "0ms", animationDuration: "600ms" }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
        style={{ animationDelay: "150ms", animationDuration: "600ms" }}
      />
      <span
        className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
        style={{ animationDelay: "300ms", animationDuration: "600ms" }}
      />
    </div>
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
            <XIcon size={14} className="text-destructive shrink-0" />
          ) : (
            <TypingDots />
          )}
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}
