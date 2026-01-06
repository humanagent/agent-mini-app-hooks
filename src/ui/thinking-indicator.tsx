import { Loader2Icon, XIcon } from "./icons";

export function ThinkingIndicator({
  message,
  error,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <div className="flex w-full items-start gap-2 md:gap-3 justify-start">
      <div className="flex flex-col gap-2 md:gap-4 max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]">
        <div className="flex items-center gap-2">
          {error ? (
            <XIcon size={14} className="text-white shrink-0" />
          ) : (
            <Loader2Icon
              size={14}
              className="animate-spin text-white shrink-0"
            />
          )}
          <p className="text-sm text-white">{message}</p>
        </div>
      </div>
    </div>
  );
}
