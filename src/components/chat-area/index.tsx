import { motion } from "framer-motion";
import type { Conversation } from "@xmtp/browser-sdk";

export const ChatHeader = ({
  conversation: _conversation,
}: {
  conversation: Conversation | null;
}) => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-background px-3 py-2 md:px-4">
    </header>
  );
};

export const Greeting = () => {
  return (
    <div
      className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="font-semibold text-xl md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5, duration: 0.15 }}
      >
        Hello there
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-xl text-muted-foreground md:text-2xl"
        exit={{ opacity: 0, y: 10 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6, duration: 0.15 }}
      >
        This chat is secured by XMTP. Each conversation its a new identity,
        untraceable to the previous one
      </motion.div>
    </div>
  );
};
