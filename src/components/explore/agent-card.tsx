import type { AgentConfig } from "@/agent-registry/agents";
import { ArrowUpIcon, BaseIcon, WorldIcon } from "@ui/icons";
import { motion } from "framer-motion";

function LiveIndicator() {
  return (
    <div className="relative flex items-center gap-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span className="text-[9px] font-medium text-green-500 uppercase tracking-wide">Live</span>
    </div>
  );
}

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
    agent.suggestions?.[0]?.replace(`@${agent.name}`, "").trim() ||
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";

  const handleBaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `cbwallet://messaging/${agent.address}`;
  };

  const handleWorldClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://world.xmtp.org/chat/${agent.address}`, "_blank");
  };

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
                {agent.live && <LiveIndicator />}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">{description}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="flex items-center justify-center rounded p-1 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.97]"
                onClick={handleBaseClick}
                type="button"
              >
                <BaseIcon size={14} />
              </button>
              <button
                className="flex items-center justify-center rounded p-1 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.97]"
                onClick={handleWorldClick}
                type="button"
              >
                <WorldIcon size={14} />
              </button>
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
          {agent.live && <LiveIndicator />}
        </div>
        <p className="truncate text-[10px] text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="flex items-center justify-center rounded p-1 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.97]"
          onClick={handleBaseClick}
          type="button"
        >
          <BaseIcon size={14} />
        </button>
        <button
          className="flex items-center justify-center rounded p-1 transition-all duration-200 hover:bg-zinc-800 active:scale-[0.97]"
          onClick={handleWorldClick}
          type="button"
        >
          <WorldIcon size={14} />
        </button>
        <ArrowUpIcon
          className="shrink-0 rotate-45 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          size={14}
        />
      </div>
    </motion.div>
  );
}
