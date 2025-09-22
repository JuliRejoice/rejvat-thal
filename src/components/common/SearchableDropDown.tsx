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
  required?: boolean;
  error?: string;
  onClose?: () => void;
};

export function SearchableDropDown({
  options,
  onSearch,
  value,
  onChange,
  required,
  error,
  onClose
}: SearchableDropDownProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState("");
  const [optionSelected, setOptionSelected] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const selectedValue = value ?? internalValue;

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  React.useEffect(() => {
    if (open) {
      setSearchQuery("");
    }
  }, [open]);

  console.log(searchQuery,'-------------------');

  return (
    <div>
      <Popover open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen && !optionSelected) {
          if (onClose) {
            onClose();
          }
        }

        if (newOpen) { // When opening
          setSearchQuery(""); // Clear search
        }

        if (!newOpen) { // When popover closes
          setOptionSelected(false);
          setSearchQuery(""); // Always clear search
          if (!optionSelected && onClose) {
            onClose(); // Call callback if needed
          }
        }
      }}>
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
                setSearchQuery(val);
              }}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions?.map((opt) => (
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
                      setSearchQuery("");
                      setOptionSelected(true);
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
                      setSearchQuery("");
                      setOptionSelected(true);
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
      {required && !selectedValue && (
        <p className="mt-1 text-sm text-red-500">{error ?? "This field is required"}</p>
      )}
    </div>
  );
}
