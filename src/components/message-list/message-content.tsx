import { parseAgentMentions } from "./parse-mentions";
import type { AgentConfig } from "@/agent-registry/agents";
import { cn } from "@/lib/utils";

type MessageContentProps = {
  content: string;
  onMentionClick?: (agent: AgentConfig) => void;
  className?: string;
};

function AgentProfileHover({ agent }: { agent: AgentConfig }) {
  const description =
    agent.description ||
    agent.suggestions?.[0]?.replace(`@${agent.name}`, "").trim() ||
    "AI agent";

  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded border border-zinc-800 bg-zinc-950 p-3 shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <div className="flex gap-3">
        {agent.image ? (
          <img
            alt={agent.name}
            className="size-10 shrink-0 rounded object-cover"
            src={agent.image}
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-xs font-semibold text-foreground">
            {agent.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-xs">{agent.name}</h3>
            <span
              className={cn(
                "text-[9px] shrink-0 px-1.5 py-0.5 rounded font-medium",
                agent.live
                  ? "bg-green-500/20 text-green-500"
                  : "bg-zinc-800 text-zinc-500",
              )}
            >
              {agent.live ? "ONLINE" : "DOWN"}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
            {description}
          </p>
          {agent.domain && (
            <p className="mt-1 truncate text-[9px] text-muted-foreground/70">
              {agent.domain}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessageContent({
  content,
  onMentionClick,
  className,
}: MessageContentProps) {
  const segments = parseAgentMentions(content);

  return (
    <p className={cn("leading-relaxed", className)}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        return (
          <span key={index} className="relative inline-block group">
            <button
              type="button"
              onClick={() => onMentionClick?.(segment.agent)}
              className="text-zinc-600 hover:text-zinc-400 underline underline-offset-2 cursor-pointer transition-colors duration-200"
            >
              @{segment.agentName}
            </button>
            <AgentProfileHover agent={segment.agent} />
          </span>
        );
      })}
    </p>
  );
}
