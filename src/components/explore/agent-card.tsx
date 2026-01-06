import type { AgentConfig } from "@/agent-registry/agents";
import { ArrowUpIcon } from "@ui/icons";
import { motion } from "framer-motion";

type AgentCardProps = {
  agent: AgentConfig;
  onClick: () => void;
  featured?: boolean;
};

export function AgentCard({ agent, onClick, featured = false }: AgentCardProps) {
  const description =
    agent.suggestions?.[0]?.replace(`@${agent.name}`, "").trim() ||
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";

  if (featured) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="group relative cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-6 transition-all hover:from-primary/30 hover:to-primary/10"
        initial={{ opacity: 0, y: 10 }}
        onClick={onClick}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {agent.image ? (
              <img
                alt={agent.name}
                className="size-16 rounded-lg object-cover"
                src={agent.image}
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-lg bg-primary/20 text-2xl font-semibold text-primary">
                {agent.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80"
      initial={{ opacity: 0, y: 10 }}
      onClick={onClick}
    >
      {agent.image ? (
        <img
          alt={agent.name}
          className="size-12 shrink-0 rounded-lg object-cover"
          src={agent.image}
        />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-lg font-semibold text-primary">
          {agent.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-sm">{agent.name}</h3>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowUpIcon
        className="shrink-0 rotate-45 opacity-0 transition-opacity group-hover:opacity-100"
        size={16}
      />
    </motion.div>
  );
}
