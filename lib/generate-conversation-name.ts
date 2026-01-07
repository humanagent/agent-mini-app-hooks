import { AI_AGENTS } from "@/agent-registry/agents";

export interface ConversationMetadata {
  name: string;
  description: string;
}

export async function generateConversationMetadata(
  firstMessage: string,
  agentAddresses: string[],
): Promise<ConversationMetadata> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.log(
      "[generateConversationMetadata] VITE_OPENAI_API_KEY not set, using fallback",
    );
    return getFallbackMetadata(agentAddresses);
  }

  const agentNames = agentAddresses
    .map((addr) => {
      const normalizedAddr = addr.toLowerCase();
      return AI_AGENTS.find(
        (agent) => agent.address.toLowerCase() === normalizedAddr,
      );
    })
    .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined)
    .map((agent) => agent.name);

  const agentNamesText =
    agentNames.length > 0
      ? `Agents: ${agentNames.join(", ")}`
      : "Multiple agents";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              'Generate a short conversation title (max 40 chars) and a brief description (max 100 chars) based on the first message and agents. Return JSON: {"name": "title", "description": "brief description"}.',
          },
          {
            role: "user",
            content: `First message: "${firstMessage}"\n${agentNamesText}\n\nGenerate conversation metadata.`,
          },
        ],
        max_tokens: 80,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[generateConversationMetadata] API error:",
        response.status,
        errorText,
      );
      return getFallbackMetadata(agentAddresses);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const content = data.choices[0]?.message?.content?.trim() || "";

    try {
      const parsed = JSON.parse(content) as {
        name?: string;
        description?: string;
      };
      const name = (parsed.name || "").replace(/^["']|["']$/g, "").slice(0, 40);
      const description = (parsed.description || "").slice(0, 100);

      if (name) {
        return {
          name,
          description: description || `Chat with ${agentNamesText}`,
        };
      }
    } catch {
      const name = content.replace(/^["']|["']$/g, "").slice(0, 40);
      if (name) {
        return { name, description: `Chat with ${agentNamesText}` };
      }
    }

    return getFallbackMetadata(agentAddresses);
  } catch (error) {
    console.error("[generateConversationMetadata] Error:", error);
    return getFallbackMetadata(agentAddresses);
  }
}

function getFallbackMetadata(agentAddresses: string[]): ConversationMetadata {
  const agentNames = agentAddresses
    .map((addr) => {
      const normalizedAddr = addr.toLowerCase();
      return AI_AGENTS.find(
        (agent) => agent.address.toLowerCase() === normalizedAddr,
      );
    })
    .filter((agent): agent is NonNullable<typeof agent> => agent !== undefined)
    .map((agent) => agent.name);

  if (agentNames.length > 0) {
    const name =
      agentNames.length === 1
        ? `Chat with ${agentNames[0]}`
        : `Chat with ${agentNames.join(", ")}`;
    return { name, description: `Conversation with ${agentNames.join(", ")}` };
  }

  return { name: "Agent Group", description: "Group conversation" };
}
