import { useRef, useState, forwardRef } from "react";
import { Smile } from "lucide-react";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EmojiTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export const EmojiTextarea = forwardRef<HTMLTextAreaElement, EmojiTextareaProps>(
  ({ value, onValueChange, className, onChange, ...props }, _ref) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    const [open, setOpen] = useState(false);

    const insertEmoji = (emoji: string) => {
      const ta = innerRef.current;
      if (!ta) {
        onValueChange((value || "") + emoji);
        return;
      }
      const start = ta.selectionStart ?? value.length;
      const end = ta.selectionEnd ?? value.length;
      const next = value.slice(0, start) + emoji + value.slice(end);
      onValueChange(next);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = start + emoji.length;
        ta.setSelectionRange(pos, pos);
      });
    };

    return (
      <div className="relative">
        <Textarea
          ref={innerRef}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            onChange?.(e);
          }}
          className={cn("pr-10", className)}
          {...props}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Inserir emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-border"
            align="end"
            side="bottom"
          >
            <EmojiPicker
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              lazyLoadEmojis
              searchPlaceHolder="Buscar emoji..."
              width={320}
              height={380}
              onEmojiClick={(data) => {
                insertEmoji(data.emoji);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
EmojiTextarea.displayName = "EmojiTextarea";
