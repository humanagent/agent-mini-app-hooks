import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { AI_AGENTS, type AgentConfig } from "@/agent-registry/agents";
import { AgentCard } from "./agent-card";
import { useXMTPClient } from "@hooks/use-xmtp-client";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";
import { createGroupWithAgentAddresses } from "@/lib/xmtp/conversations";
import { Input } from "@ui/input";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { ShareButton } from "@/src/components/sidebar/share-button";

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "production" | "dev">("all");
  const navigate = useNavigate();
  const { client } = useXMTPClient();
  const { setSelectedConversation, refreshConversations } = useConversationsContext();

  const filteredAgents = useMemo(() => {
    let filtered = AI_AGENTS;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((agent) => {
        if (selectedCategory === "production") {
          return agent.networks.includes("production");
        }
        return agent.networks.includes("dev");
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.domain?.toLowerCase().includes(query) ||
          agent.suggestions?.some((s) => s.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const featuredAgent = useMemo(() => {
    const withImages = filteredAgents.filter((a) => a.image);
    return withImages[0] || filteredAgents[0];
  }, [filteredAgents]);

  const regularAgents = useMemo(() => {
    return filteredAgents.filter((agent) => agent !== featuredAgent);
  }, [filteredAgents, featuredAgent]);

  const handleAgentClick = async (agent: AgentConfig) => {
    if (!client) {
      console.warn("[Explore] Cannot create conversation: client not available");
      return;
    }

    try {
      console.log("[Explore] Creating conversation with agent:", agent.name, agent.address);
      
      const conversation = await createGroupWithAgentAddresses(client, [
        agent.address,
      ]);
      
      console.log("[Explore] Conversation created:", conversation.id);
      setSelectedConversation(conversation);
      
      await refreshConversations();
      console.log("[Explore] Conversations refreshed");
      
      console.log("[Explore] Navigating to chat...");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("[Explore] Failed to create conversation:", error);
      if (error instanceof Error) {
        console.error("[Explore] Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      alert(`Failed to start conversation with ${agent.name}. Please try again.`);
    }
  };

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-background">
      <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
        <SidebarToggle />
        <ShareButton />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-8">
            <h1 className="mb-2 font-semibold text-3xl">Agents</h1>
            <p className="text-muted-foreground">
              Chat with your favorite XMTP agents
            </p>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <Input
              className="max-w-md"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents..."
              value={searchQuery}
            />
          </div>

          <div className="mb-6 flex gap-2 border-b border-border">
            <button
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedCategory("all")}
              type="button"
            >
              All
            </button>
            <button
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === "production"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedCategory("production")}
              type="button"
            >
              Production
            </button>
            <button
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === "dev"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedCategory("dev")}
              type="button"
            >
              Dev
            </button>
          </div>

          {featuredAgent && (
            <div className="mb-8">
              <AgentCard
                agent={featuredAgent}
                featured
                onClick={() => handleAgentClick(featuredAgent)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {regularAgents.map((agent) => (
              <AgentCard
                key={agent.address}
                agent={agent}
                onClick={() => handleAgentClick(agent)}
              />
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                No agents found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
