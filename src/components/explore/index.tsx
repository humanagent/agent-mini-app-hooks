import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { AI_AGENTS, type AgentConfig } from "@/agent-registry/agents";
import { AgentCard } from "./agent-card";
import { Input } from "@ui/input";
import { SearchIcon } from "@ui/icons";

export function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const allAgents = useMemo(() => {
    return AI_AGENTS;
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      allAgents.map((agent) => agent.category).filter(
        (category): category is string => Boolean(category),
      ),
    );
    return ["All", ...Array.from(uniqueCategories).sort()];
  }, [allAgents]);

  const categoryAgentCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allAgents.length };
    for (const agent of allAgents) {
      if (agent.category) {
        counts[agent.category] = (counts[agent.category] || 0) + 1;
      }
    }
    return counts;
  }, [allAgents]);

  const filteredAgents = useMemo(() => {
    let agents = allAgents;

    if (selectedCategory !== "All") {
      agents = agents.filter((agent) => agent.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      agents = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.category?.toLowerCase().includes(query) ||
          agent.description?.toLowerCase().includes(query) ||
          agent.suggestions?.some((s) => s.toLowerCase().includes(query)),
      );
    }

    return agents;
  }, [allAgents, selectedCategory, searchQuery]);

  const handleAgentClick = (agent: AgentConfig) => {
    console.log(
      "[Explore] Navigating to chat with agent:",
      agent.name,
      agent.address,
    );

    // Navigate to chat with agent in state to pre-select it
    navigate("/chat", {
      replace: true,
      state: { selectedAgent: agent },
    });
  };

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-black">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          <div className="mb-8">
            <h1 className="mb-2 font-semibold text-xl">Agent Store</h1>
            <p className="text-xs text-muted-foreground">
              Discover and interact with XMTP agents
            </p>
          </div>

          <div className="relative mb-6">
            <SearchIcon
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-zinc-950 border-zinc-800 focus:border-zinc-700"
            />
          </div>

          <div className="mb-6 flex gap-2 border-b border-zinc-800 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`border-b-2 px-4 py-2 text-xs font-medium transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === category
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                {category}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    selectedCategory === category
                      ? "bg-accent/20 text-accent"
                      : "bg-zinc-800 text-muted-foreground"
                  }`}
                >
                  {categoryAgentCounts[category] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.address}
                agent={agent}
                onClick={() => handleAgentClick(agent)}
              />
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-xs text-muted-foreground">
                {searchQuery.trim()
                  ? `No agents found matching "${searchQuery}"`
                  : "No agents found in this category."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
