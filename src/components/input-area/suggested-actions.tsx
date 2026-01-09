import { Button } from "@ui/button";
import { motion } from "framer-motion";

type SuggestedActionsProps = {
  suggestions: string[];
  onClick: (suggestion: string) => void;
};

export function SuggestedActions({
  suggestions,
  onClick,
}: SuggestedActionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      {suggestions.map((suggestedAction, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          key={suggestedAction}
          transition={{ delay: 0.05 * index, duration: 0.15 }}
        >
          <Button
            className="h-auto w-full whitespace-normal p-3 text-left"
            onClick={() => {
              onClick(suggestedAction);
            }}
            type="button"
            variant="outline"
          >
            {suggestedAction}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
