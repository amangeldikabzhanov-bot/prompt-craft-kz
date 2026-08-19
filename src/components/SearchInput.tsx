import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  size?: "default" | "lg";
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Іздеу...",
  className,
  autoFocus,
  size = "default",
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "group glass relative flex items-center rounded-2xl transition-all duration-300 focus-within:border-primary/60 focus-within:shadow-[var(--shadow-glow)]",
        size === "lg" ? "h-14 px-5" : "h-12 px-4",
        className,
      )}
    >
      <Search className="mr-3 size-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none",
          size === "lg" ? "text-base" : "text-sm",
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Тазалау"
          onClick={() => onChange("")}
          className="ml-2 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
