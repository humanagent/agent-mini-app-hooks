import { useState, useEffect } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { PlusIcon, TrashIcon, EditIcon } from "@ui/icons";
import type { AgentConfig } from "@/agent-registry/agents";
import {
  getUserAgents,
  saveUserAgent,
  deleteUserAgent,
} from "@/lib/agent-storage";
import { useToast } from "@ui/toast";

function AgentForm({
  agent,
  onSave,
  onCancel,
}: {
  agent?: AgentConfig;
  onSave: (agent: AgentConfig) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<AgentConfig>>({
    name: agent?.name || "",
    address: agent?.address || "",
    networks: agent?.networks || ["production"],
    live: agent?.live ?? true,
    description: agent?.description || "",
    category: agent?.category || "",
    domain: agent?.domain || "",
    image: agent?.image || "",
    suggestions: agent?.suggestions || [],
  });

  const [suggestionInput, setSuggestionInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      return;
    }

    const agentData: AgentConfig = {
      name: formData.name,
      address: formData.address,
      networks: formData.networks || ["production"],
      live: formData.live ?? true,
      description: formData.description,
      category: formData.category,
      domain: formData.domain,
      image: formData.image,
      suggestions: formData.suggestions,
    };

    onSave(agentData);
  };

  const addSuggestion = () => {
    if (suggestionInput.trim()) {
      setFormData({
        ...formData,
        suggestions: [...(formData.suggestions || []), suggestionInput.trim()],
      });
      setSuggestionInput("");
    }
  };

  const removeSuggestion = (index: number) => {
    const newSuggestions = [...(formData.suggestions || [])];
    newSuggestions.splice(index, 1);
    setFormData({ ...formData, suggestions: newSuggestions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Name *</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="myagent"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">
          Address * (0x...)
        </label>
        <Input
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="0x1234567890123456789012345678901234567890"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">
          Description
        </label>
        <Textarea
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="What does your agent do?"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Category</label>
        <Input
          value={formData.category || ""}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          placeholder="Finance, Business, Trading, etc."
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Domain</label>
        <Input
          value={formData.domain || ""}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          placeholder="myagent.eth"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Image URL</label>
        <Input
          value={formData.image || ""}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://ipfs.io/ipfs/..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">
          Suggestions
        </label>
        <div className="flex gap-2">
          <Input
            value={suggestionInput}
            onChange={(e) => setSuggestionInput(e.target.value)}
            placeholder="@myagent Help with..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSuggestion();
              }
            }}
          />
          <Button type="button" onClick={addSuggestion} size="sm">
            Add
          </Button>
        </div>
        {formData.suggestions && formData.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-xs"
              >
                <span>{suggestion}</span>
                <button
                  type="button"
                  onClick={() => removeSuggestion(index)}
                  className="hover:text-destructive transition-colors"
                >
                  <TrashIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="live"
          checked={formData.live}
          onChange={(e) => setFormData({ ...formData, live: e.target.checked })}
          className="size-4 rounded border border-zinc-800 bg-zinc-950 checked:bg-accent checked:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200"
        />
        <label htmlFor="live" className="text-xs text-foreground">
          Live
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {agent ? "Update" : "Create"} Agent
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AgentList({
  agents,
  onEdit,
  onDelete,
}: {
  agents: AgentConfig[];
  onEdit: (agent: AgentConfig) => void;
  onDelete: (address: string) => void;
}) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground">
        No agents yet. Create your first agent to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {agents.map((agent) => (
        <div
          key={agent.address}
          className="flex items-center justify-between p-3 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs truncate">{agent.name}</h3>
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
            <p className="text-[10px] text-muted-foreground truncate mt-1">
              {agent.description || agent.address}
            </p>
            <p className="text-[9px] text-muted-foreground truncate mt-0.5">
              {agent.address}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(agent)}
            >
              <EditIcon size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(agent.address)}
            >
              <TrashIcon size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PortalPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [editingAgent, setEditingAgent] = useState<AgentConfig | undefined>();
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = () => {
    const userAgents = getUserAgents();
    setAgents(userAgents);
  };

  const handleSave = (agent: AgentConfig) => {
    try {
      saveUserAgent(agent);
      loadAgents();
      setShowForm(false);
      setEditingAgent(undefined);
      showToast(
        `Agent ${editingAgent ? "updated" : "created"} successfully`,
        "success",
      );
    } catch (error) {
      console.error("[Portal] Error saving agent:", error);
      showToast("Failed to save agent", "error");
    }
  };

  const handleDelete = (address: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this agent? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      deleteUserAgent(address);
      loadAgents();
      showToast("Agent deleted successfully", "success");
    } catch (error) {
      console.error("[Portal] Error deleting agent:", error);
      showToast("Failed to delete agent", "error");
    }
  };

  const handleEdit = (agent: AgentConfig) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleNewAgent = () => {
    setEditingAgent(undefined);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAgent(undefined);
  };

  return (
    <div className="flex h-dvh min-w-0 flex-col bg-black">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="font-semibold text-xl">Developer Portal</h1>
                <p className="text-xs text-muted-foreground">
                  Publish and manage your XMTP agents
                </p>
              </div>
              {!showForm && (
                <Button onClick={handleNewAgent} size="sm">
                  <PlusIcon size={14} />
                  New Agent
                </Button>
              )}
            </div>
          </div>

      {showForm ? (
        <div className="rounded border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="font-semibold text-sm mb-4">
            {editingAgent ? "Edit Agent" : "Create New Agent"}
          </h2>
          <AgentForm
            agent={editingAgent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <div className="rounded border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="font-semibold text-sm mb-4">Your Agents</h2>
          <AgentList
            agents={agents}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
