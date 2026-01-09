import { XIcon } from "@ui/icons";
import { AnimatePresence, motion } from "framer-motion";
import type { AgentConfig } from "@/agent-registry/agents";
import type { Conversation } from "@xmtp/browser-sdk";
import { truncateAddress } from "./utils";

type AgentChipsProps = {
  agents: AgentConfig[];
  members: string[];
  onRemoveAgent: (address: string) => void;
  onRemoveMember: (address: string) => void;
  isMultiAgentMode: boolean;
  isMessageListMode: boolean;
  conversation?: Conversation | null;
};

export function AgentChips({
  agents,
  members,
  onRemoveAgent,
  onRemoveMember,
  isMultiAgentMode,
  isMessageListMode,
  conversation,
}: AgentChipsProps) {
  if (agents.length === 0 && members.length === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "auto" }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 overflow-hidden flex-wrap"
      >
        {/* Agent chips */}
        {agents.map((agent) => (
          <motion.div
            key={`agent-${agent.address}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-foreground h-6"
          >
            {agent.image ? (
              <img
                alt={agent.name}
                className="h-4 w-4 shrink-0 rounded object-cover"
                src={agent.image}
              />
            ) : (
              <div className="h-4 w-4 shrink-0 rounded bg-muted" />
            )}
            <span>{agent.name}</span>
            {(isMultiAgentMode || (isMessageListMode && conversation)) && (
              <button
                type="button"
                onClick={() => {
                  onRemoveAgent(agent.address);
                }}
                className="rounded hover:bg-zinc-700 p-0.5 transition-colors duration-200 active:scale-[0.97]"
              >
                <XIcon size={12} />
              </button>
            )}
          </motion.div>
        ))}

        {/* Member chips */}
        {members.map((address) => (
          <motion.div
            key={`member-${address}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-foreground h-6"
          >
            <span>{truncateAddress(address)}</span>
            <button
              type="button"
              onClick={() => {
                onRemoveMember(address);
              }}
              className="rounded hover:bg-zinc-700 p-0.5 transition-colors duration-200 active:scale-[0.97]"
            >
              <XIcon size={12} />
            </button>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
