import { useState } from "react";
import type { Conversation } from "@xmtp/browser-sdk";
import { Group } from "@xmtp/browser-sdk";
import type { AgentConfig } from "@xmtp/agents";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";

export function useAgentManagement({
  conversation,
  isMultiAgentMode,
  isMessageListMode,
  isGroup,
  selectedAgents,
  setSelectedAgents,
  conversationAgents,
  setPlusPanelOpen,
  onOpenAgentsDialogChange,
  textareaRef,
  setSingleAgent,
}: {
  conversation?: Conversation | null;
  isMultiAgentMode: boolean;
  isMessageListMode: boolean;
  isGroup: boolean;
  selectedAgents?: AgentConfig[];
  setSelectedAgents?: (agents: AgentConfig[]) => void;
  conversationAgents: AgentConfig[];
  setPlusPanelOpen: (open: boolean) => void;
  onOpenAgentsDialogChange?: (open: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setSingleAgent?: (agent: AgentConfig | undefined) => void;
}) {
  const [confirmAddAgentOpen, setConfirmAddAgentOpen] = useState(false);
  const [agentToAdd, setAgentToAdd] = useState<AgentConfig | null>(null);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [confirmRemoveAgentOpen, setConfirmRemoveAgentOpen] = useState(false);
  const [agentToRemove, setAgentToRemove] = useState<AgentConfig | null>(null);
  const [isRemovingAgent, setIsRemovingAgent] = useState(false);
  const { refreshConversations } = useConversationsContext();

  const handleAddAgent = (agent: AgentConfig) => {
    if (isMultiAgentMode) {
      const agents = selectedAgents || [];
      const setAgents = setSelectedAgents as (agents: AgentConfig[]) => void;
      // Check if agent is already selected
      const isAlreadySelected = agents.some((a) => a.address === agent.address);
      if (!isAlreadySelected) {
        // Add to array instead of replace
        setAgents([...agents, agent]);
      }
      setPlusPanelOpen(false);
      onOpenAgentsDialogChange?.(false);
      textareaRef.current?.focus();
    } else {
      if (conversation) {
        // If conversation exists and it's a group, show confirmation dialog
        if (isGroup && conversation instanceof Group) {
          setAgentToAdd(agent);
          setConfirmAddAgentOpen(true);
          setPlusPanelOpen(false);
          onOpenAgentsDialogChange?.(false);
          return;
        }
        setPlusPanelOpen(false);
        onOpenAgentsDialogChange?.(false);
        textareaRef.current?.focus();
        return;
      }
      // Update both singleAgent state and selectedAgents prop (if provided)
      setSingleAgent?.(agent);
      if (setSelectedAgents) {
        setSelectedAgents([agent]);
      }
      setPlusPanelOpen(false);
      onOpenAgentsDialogChange?.(false);
      textareaRef.current?.focus();
    }

    textareaRef.current?.focus();
  };

  const handleConfirmAddAgent = async () => {
    if (!agentToAdd || !conversation || !(conversation instanceof Group)) {
      return;
    }

    setIsAddingAgent(true);
    try {
      await conversation.addMembersByIdentifiers([
        {
          identifier: agentToAdd.address.toLowerCase(),
          identifierKind: "Ethereum" as const,
        },
      ]);
      void refreshConversations();
      setConfirmAddAgentOpen(false);
      setAgentToAdd(null);
    } catch (error) {
      console.error("[InputArea] Error adding agent to conversation:", error);
    } finally {
      setIsAddingAgent(false);
    }
  };

  const handleRemoveAgent = async (address: string) => {
    if (isMultiAgentMode) {
      const agents = selectedAgents || [];
      const setAgents = setSelectedAgents as (agents: AgentConfig[]) => void;
      setAgents(agents.filter((a) => a.address !== address));
    } else if (isMessageListMode && conversation) {
      // In message list mode with existing conversation, show confirmation dialog
      const agent = conversationAgents.find(
        (a) => a.address.toLowerCase() === address.toLowerCase(),
      );
      if (agent && isGroup && conversation instanceof Group) {
        // Check member count - don't show modal if there are only 2 members
        const members = await conversation.members();
        if (members.length <= 2) {
          return;
        }
        setAgentToRemove(agent);
        setConfirmRemoveAgentOpen(true);
      }
    }
  };

  const handleConfirmRemoveAgent = async () => {
    if (!agentToRemove || !conversation || !(conversation instanceof Group)) {
      return;
    }

    setIsRemovingAgent(true);
    try {
      // Get the member's inboxId to remove them
      const members = await conversation.members();
      const memberToRemove = members.find((member) =>
        member.accountIdentifiers.some(
          (id) =>
            id.identifierKind === "Ethereum" &&
            id.identifier.toLowerCase() === agentToRemove.address.toLowerCase(),
        ),
      );

      if (memberToRemove) {
        await conversation.removeMembers([memberToRemove.inboxId]);
        void refreshConversations();
        setConfirmRemoveAgentOpen(false);
        setAgentToRemove(null);
      } else {
        throw new Error("Member not found in conversation");
      }
    } catch (error) {
      console.error(
        "[InputArea] Error removing agent from conversation:",
        error,
      );
    } finally {
      setIsRemovingAgent(false);
    }
  };

  return {
    handleAddAgent,
    handleRemoveAgent,
    confirmAddAgentOpen,
    setConfirmAddAgentOpen,
    agentToAdd,
    setAgentToAdd,
    isAddingAgent,
    handleConfirmAddAgent,
    confirmRemoveAgentOpen,
    setConfirmRemoveAgentOpen,
    agentToRemove,
    setAgentToRemove,
    isRemovingAgent,
    handleConfirmRemoveAgent,
  };
}
