import { motion } from "framer-motion";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { ShareButton } from "@/src/components/sidebar/share-button";

export const ChatHeader = () => {
  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />
      <ShareButton />
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

