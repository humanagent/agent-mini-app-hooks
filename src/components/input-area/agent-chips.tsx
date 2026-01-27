import { XIcon } from "@ui/icons";
import { useEffect, useState } from "react";
import type { AgentConfig } from "@lib/agent-utils";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";

type AgentChipsProps = {
  agents: AgentConfig[];
  onRemoveAgent: (address: string) => void;
  isMultiAgentMode: boolean;
  isMessageListMode: boolean;
  conversation?: Conversation | null;
};

export function AgentChips({
  agents,
  onRemoveAgent,
  isMultiAgentMode,
  isMessageListMode,
  conversation,
}: AgentChipsProps) {
  const [canRemove, setCanRemove] = useState(true);

  useEffect(() => {
    if (isMessageListMode && conversation instanceof Group) {
      void (async () => {
        try {
          const groupMembers = await conversation.members();
          setCanRemove(groupMembers.length > 2);
        } catch (error) {
          console.error("[AgentChips] Error fetching members:", error);
          setCanRemove(true);
        }
      })();
    } else {
      setCanRemove(true);
    }
  }, [conversation, isMessageListMode]);

  if (agents.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 overflow-hidden flex-wrap animate-fade-in">
      {/* Agent chips */}
      {agents.map((agent) => (
        <div
          key={`agent-${agent.address}`}
          className="inline-flex items-center gap-1 rounded bg-zinc-800 px-2 py-0.5 text-xs text-foreground h-6 animate-fade-in-scale"
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
          {(isMultiAgentMode || (isMessageListMode && conversation)) &&
            canRemove && (
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
        </div>
      ))}
    </div>
  );
}
