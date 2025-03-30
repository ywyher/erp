"use client"
import { icons as LucideIcons } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useMemo, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { Input } from "@/components/ui/input";

export type IconName = keyof typeof LucideIcons;

export default function IconSelector({
  selectedIcon,
  setSelectedIcon,
  onChange,
  value
}: {
  selectedIcon?: IconName;
  setSelectedIcon?: Dispatch<SetStateAction<IconName>>
  value?: IconName;
  onChange?: (value: IconName) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const iconNames = useMemo(() => Object.keys(LucideIcons) as IconName[], []);
  
  const filteredIcons = useMemo(() => {
    if (!query) return iconNames;
    const lowerQuery = query.toLowerCase();
    return iconNames.filter((iconName) => 
      iconName.toLowerCase().includes(lowerQuery)
    );
  }, [iconNames, query]);
  
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      setQuery('');
    }
  }, []);
  
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);
  
  const handleSelect = useCallback((iconName: IconName) => {
    if(setSelectedIcon) {
      setSelectedIcon(iconName);
    }
    if (onChange) {
      onChange(iconName);
    }
    setOpen(false);
  }, [onChange]);
  
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const iconName = filteredIcons[index];
    if (!iconName) return null;
    
    const IconComponent = LucideIcons[iconName];
    
    return (
      <div
        onClick={() => handleSelect(iconName)}
        style={style}
        className="
          flex items-center gap-3
          px-2 py-1 cursor-pointer
          hover:bg-slate-100 dark:hover:bg-slate-800 rounded
      ">
        <IconComponent size={16} />
        <span>{iconName}</span>
      </div>
    );
  }, [filteredIcons, handleSelect]);
  
  // Get the currently selected icon component
  const SelectedIcon = selectedIcon ? LucideIcons[selectedIcon] : (value ? LucideIcons[value] : null);
  
  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            {SelectedIcon ? (
              <div className="flex items-center gap-2">
                <SelectedIcon size={16} />
                <span>{selectedIcon ? selectedIcon : value}</span>
              </div>
            ) : (
              "Select an icon"
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="p-2 w-full min-w-[var(--radix-popper-anchor-width)]">
          <Input
            ref={searchInputRef}
            placeholder="Search icons..."
            value={query}
            onChange={handleSearchChange}
            className="mb-2"
          />
          
          {filteredIcons.length > 0 ? (
            <List
              height={300}
              width="100%"
              itemCount={filteredIcons.length}
              itemSize={35}
            >
              {Row}
            </List>
          ) : (
            <div className="py-2 text-center text-gray-500">No icons found</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}