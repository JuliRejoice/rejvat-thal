import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Options = {
  id: string;
  name: string;
};

type SearchableDropDownProps = {
  options: Options[];
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchableDropDown({
  options,
  onSearch,
  value,
  onChange,
}: SearchableDropDownProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState("");
  const selectedValue = value ?? internalValue;
  console.log("NO**", options, selectedValue)
  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedValue
              ? options.find((opt) => opt.id === selectedValue)?.name
              : "Select option..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          className="w-full p-0 z-[9999] pointer-events-auto"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search..."
              className="h-9"
              onValueChange={(val) => {
                if (onSearch) {
                  onSearch(val);
                }
              }}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options?.map((opt) => (
                  <CommandItem
                    key={opt.id}
                    value={opt.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={() => {
                      if (onChange) {
                        onChange(opt.id === selectedValue ? "" : opt.id);
                      } else {
                        setInternalValue(
                          opt.id === internalValue ? "" : opt.id
                        );
                      }
                      setOpen(false);
                    }}
                    onSelect={(currentValue) => {
                      if (onChange) {
                        onChange(
                          currentValue === selectedValue ? "" : currentValue
                        );
                      } else {
                        setInternalValue(
                          currentValue === internalValue ? "" : currentValue
                        );
                      }
                      setOpen(false);
                    }}
                  >
                    {opt.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedValue === opt.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
