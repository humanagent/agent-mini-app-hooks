import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Group } from "@xmtp/browser-sdk";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { AgentConfig } from "@/agent-registry/agents";
import { cn } from "@/lib/utils";
import { useConversationsContext } from "@/src/contexts/xmtp-conversations-context";

type PlusPanelProps = {
	open: boolean;
	agents: AgentConfig[];
	selectedAgents: AgentConfig[];
	onSelectAgent: (agent: AgentConfig) => void;
	selectedMembers: string[];
	onSelectMember: (address: string) => void;
	isGroup: boolean;
	group?: Group | null;
	onClose?: () => void;
};

function isValidEthereumAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function PlusPanel({
	open,
	agents,
	selectedAgents,
	onSelectAgent,
	selectedMembers,
	onSelectMember,
	isGroup,
	group,
	onClose,
}: PlusPanelProps) {
	const [memberAddress, setMemberAddress] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showMemberInput, setShowMemberInput] = useState(false);
	const [agentFilter, setAgentFilter] = useState("");
	const { refreshConversations } = useConversationsContext();

	// Filter agents by name
	const filteredAgents = agentFilter.trim()
		? agents.filter((agent) =>
				agent.name.toLowerCase().includes(agentFilter.toLowerCase()),
			)
		: agents;

	// Clear filter when panel closes
	useEffect(() => {
		if (!open) {
			setAgentFilter("");
		}
	}, [open]);

	const handleAddMember = async () => {
		const trimmedAddress = memberAddress.trim();

		if (!trimmedAddress) {
			setError("Address is required");
			return;
		}

		if (!isValidEthereumAddress(trimmedAddress)) {
			setError("Invalid Ethereum address format");
			return;
		}

		setError(null);
		setIsAdding(true);

		try {
			// If there's a group, add to the actual group
			if (group) {
				await group.addMembersByIdentifiers([
					{
						identifier: trimmedAddress.toLowerCase(),
						identifierKind: "Ethereum" as const,
					},
				]);
				void refreshConversations();
			}
			
			// Always call the callback to update UI state
			onSelectMember(trimmedAddress.toLowerCase());
			setMemberAddress("");
			// Keep panel open - don't call onClose
		} catch (err) {
			console.error("[PlusPanel] Error adding member:", err);
			setError(err instanceof Error ? err.message : "Failed to add member");
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
					className="absolute bottom-full left-0 right-0 mb-2 z-50"
				>
					<div className="w-full rounded border border-zinc-800 bg-zinc-950 shadow-lg overflow-hidden">
						<div className="flex flex-col">
							{/* Add Agent Section */}
							<div className="px-2 py-2 border-b border-zinc-800">
								<Input
									placeholder="Search agents..."
									value={agentFilter}
									onChange={(e) => setAgentFilter(e.target.value)}
									className="h-7 text-xs border-0 bg-transparent"
									autoFocus
								/>
							</div>
							<div className="overflow-y-auto max-h-[200px] px-2 py-2">
								{filteredAgents.map((agent) => {
									const isSelected = selectedAgents.some(
										(a) => a.address === agent.address,
									);
									return (
										<button
											key={agent.address}
											type="button"
											onClick={() => {
												if (!isSelected) {
													onSelectAgent(agent);
												}
											}}
											disabled={isSelected}
											className={cn(
												"w-full flex items-center gap-2 px-2 py-2 rounded text-left transition-colors duration-200",
												isSelected
													? "opacity-50 cursor-not-allowed"
													: "hover:bg-zinc-800 cursor-pointer active:scale-[0.97]",
											)}
										>
											{agent.image ? (
												<img
													alt={agent.name}
													className="h-8 w-8 shrink-0 rounded object-cover"
													src={agent.image}
												/>
											) : (
												<div className="h-8 w-8 shrink-0 rounded bg-muted" />
											)}
											<div className="flex flex-col flex-1 min-w-0">
												<span className="truncate text-xs text-foreground">
													{agent.name}
												</span>
												{agent.tagline && (
													<span className="truncate text-[10px] text-muted-foreground">
														{agent.tagline}
													</span>
												)}
											</div>
										</button>
									);
								})}
								{filteredAgents.length === 0 && (
									<div className="px-2 py-4 text-center text-xs text-muted-foreground">
										{agentFilter.trim() ? "No agents found" : "No agents available"}
									</div>
								)}
							</div>

							{/* Add Member Section */}
							<div>
							{!showMemberInput ? (
								<button
									type="button"
									onClick={() => {
										setShowMemberInput(true);
									}}
									className="w-full px-4 py-3 text-left text-xs text-foreground hover:bg-zinc-800 transition-colors duration-200"
								>
									Add member
								</button>
							) : (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
										className="px-4 py-3"
									>
										<div className="flex gap-2">
											<Input
												placeholder="0x..."
												value={memberAddress}
												onChange={(e) => {
													setMemberAddress(e.target.value);
													setError(null);
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" && !isAdding) {
														void handleAddMember();
													}
												}}
												disabled={isAdding}
												className="h-8 text-xs border-0 bg-transparent"
												autoFocus
											/>
											<Button
												onClick={handleAddMember}
												disabled={isAdding || !memberAddress.trim()}
												className="h-8 px-3 text-xs"
												size="sm"
											>
												{isAdding ? "Adding..." : "Add"}
											</Button>
										</div>
										{error && (
											<p className="text-[10px] text-destructive mt-1">
												{error}
											</p>
										)}
									</motion.div>
								)}
							</div>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
