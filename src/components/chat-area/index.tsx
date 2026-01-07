import { motion } from "framer-motion";
import type { Conversation } from "@xmtp/browser-sdk";

export const ChatHeader = ({
  conversation: _conversation,
}: {
  conversation: Conversation | null;
}) => {
  // Don't render empty header - will add content later
  return null;
};

export const Greeting = ({ onOpenAgents }: { onOpenAgents?: () => void }) => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-lg"
        exit={{ opacity: 0, y: 8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ delay: 0.1, duration: 0.15 }}
      >
        Hello there
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground"
        exit={{ opacity: 0, y: 8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ delay: 0.15, duration: 0.15 }}
      >
        This chat is secured by XMTP.{" "}
        {onOpenAgents && (
          <button
            type="button"
            onClick={onOpenAgents}
            className="text-accent underline hover:text-accent/80 transition-colors duration-200 active:scale-[0.97]"
          >
            Select an agent
          </button>
        )}{" "}
        to get started.
      </motion.div>
    </div>
  );
};
