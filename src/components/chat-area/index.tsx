import { motion } from "framer-motion";
import { SidebarToggle } from "@/src/components/sidebar/sidebar-toggle";
import { Button } from "@ui/button";
import {
  ShareIcon,
  AddPeopleIcon,
  MenuIcon,
  ChevronDownIcon,
} from "@ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";

export const ChatHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-2 md:px-4">
      <div className="flex items-center gap-2">
        <SidebarToggle />
        <div className="flex items-center gap-1 cursor-pointer rounded-md px-2 py-1 hover:bg-secondary transition-colors">
          <span className="font-semibold text-sm">XMTP Agents</span>
          <ChevronDownIcon size={14} />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-8 px-2 md:h-fit md:px-2"
              variant="ghost"
              type="button"
            >
              <ShareIcon size={16} />
              <span className="ml-1 hidden md:inline text-sm">Share</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share conversation</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-8 px-2 md:h-fit md:px-2"
              variant="ghost"
              type="button"
            >
              <AddPeopleIcon size={16} />
              <span className="ml-1 hidden md:inline text-sm">Add people</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add people to conversation</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-8 px-2 md:h-fit md:px-2"
              variant="ghost"
              type="button"
            >
              <MenuIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>More options</TooltipContent>
        </Tooltip>
      </div>
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

