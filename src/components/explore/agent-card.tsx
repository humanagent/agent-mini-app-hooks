import type { AgentConfig } from "@/agent-registry/agents";
import { ArrowUpIcon } from "@ui/icons";
import { motion } from "framer-motion";

type AgentCardProps = {
  agent: AgentConfig;
  onClick: () => void;
  featured?: boolean;
};

export function AgentCard({
  agent,
  onClick,
  featured = false,
}: AgentCardProps) {
  const description =
    agent.description ||
    agent.suggestions?.[0]?.replace(`@${agent.name}`, "").trim() ||
    "AI agent ready to assist you";

  if (featured) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="group relative cursor-pointer overflow-hidden rounded border border-zinc-800 bg-zinc-950 p-4 transition-all duration-200 hover:bg-zinc-900 active:scale-[0.99]"
        initial={{ opacity: 0, y: 10 }}
        onClick={onClick}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {agent.image ? (
                <img
                  alt={agent.name}
                  className="size-12 rounded object-cover"
                  src={agent.image}
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded bg-muted text-lg font-semibold text-foreground">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-xs">{agent.name}</h3>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                    agent.live
                      ? "bg-green-500/20 text-green-500"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {agent.live ? "ONLINE" : "DOWN"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {description}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group flex cursor-pointer items-center gap-3 rounded border border-zinc-800 bg-zinc-950 p-3 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900 active:scale-[0.99]"
      initial={{ opacity: 0, y: 10 }}
      onClick={onClick}
    >
      {agent.image ? (
        <img
          alt={agent.name}
          className="size-10 shrink-0 rounded object-cover"
          src={agent.image}
        />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-muted text-sm font-semibold text-foreground">
          {agent.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-xs">{agent.name}</h3>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
              agent.live
                ? "bg-green-500/20 text-green-500"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {agent.live ? "ONLINE" : "DOWN"}
          </span>
        </div>
        <p className="truncate text-[10px] text-muted-foreground">
          {description}
        </p>
      </div>
      <ArrowUpIcon
        className="shrink-0 rotate-45 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        size={14}
      />
    </motion.div>
  );
}
