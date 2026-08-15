import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { manualSections } from "@/data/manualContent";

interface HelpButtonProps {
  section: string;
}

export function HelpButton({ section }: HelpButtonProps) {
  const [open, setOpen] = useState(false);
  const content = manualSections[section];

  if (!content) return null;

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-muted-foreground hover:text-primary">
        <HelpCircle className="h-5 w-5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="neon-text-cyan">{content.title}</DialogTitle>
            <DialogDescription>{content.subtitle}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 text-sm text-foreground/90">
              {content.blocks.map((block, i) => (
                <div key={i}>
                  {block.heading && <h3 className="font-semibold text-primary mb-1">{block.heading}</h3>}
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{block.text}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
