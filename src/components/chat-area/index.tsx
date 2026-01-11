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
      className="mx-auto flex size-full max-w-3xl flex-col justify-center px-4 pt-8 pb-4 md:mt-16 md:px-8 md:pt-0"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex mt-10 items-center gap-2 font-semibold text-lg md:text-xl lg:text-2xl"
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
        className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg"
        exit={{ opacity: 0, y: 8 }}
        initial={{ opacity: 0, y: 8 }}
        transition={{ delay: 0.15, duration: 0.15 }}
      >
        This chat is secured by XMTP.{" "}
        {onOpenAgents && (
          <button
            type="button"
            onClick={onOpenAgents}
            className="text-accent underline transition-colors duration-200 hover:text-accent/80 active:scale-[0.97]"
          >
            Select an agent
          </button>
        )}{" "}
        to get started.
      </motion.div>
    </div>
  );
};
