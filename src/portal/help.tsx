import { useMemo } from "react";
import { motion } from "framer-motion";
import { getAgentByAddress } from "@/agent-registry/agents";
import { ConversationView } from "@components/message-list/index";

const XMTP_DOCS_ADDRESS = "0x212906fdbdb70771461e6cb3376a740132e56b14";

function HelpGreeting() {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center pl-[60px] pr-4 md:mt-16 md:px-8"
      key="help-greeting"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-xl md:text-2xl flex items-center gap-2"
        exit={{ opacity: 0, y: 8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ delay: 0.1, duration: 0.15 }}
      >
        <span>Hello there</span>
        <motion.span
          animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
          transition={{
            duration: 1.5,
            delay: 0.3,
            repeat: 2,
            repeatDelay: 3,
          }}
          style={{ display: "inline-block", transformOrigin: "70% 70%" }}
        >
          👋
        </motion.span>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-base md:text-lg text-muted-foreground"
        exit={{ opacity: 0, y: 8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ delay: 0.15, duration: 0.15 }}
      >
        I'm xmtp-docs agent. I can help you building agents.
      </motion.div>
    </div>
  );
}

export function HelpPage() {
  const xmtpDocsAgent = useMemo(() => {
    return getAgentByAddress(XMTP_DOCS_ADDRESS);
  }, []);

  return (
    <ConversationView
      initialAgents={xmtpDocsAgent ? [xmtpDocsAgent] : undefined}
      customGreeting={<HelpGreeting />}
    />
  );
}
