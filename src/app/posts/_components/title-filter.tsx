"use client";

import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";
import { useDebounce } from "use-debounce";
import { useState, useEffect } from "react";

export default function TitleFilter() {
  const [title, setTitle] = useQueryState("title");
  const [inputValue, setInputValue] = useState(title || "");
  const [debouncedValue] = useDebounce(inputValue, 500); // 500ms delay
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    setTitle(debouncedValue);
  }, [debouncedValue, setTitle]);

  useEffect(() => {
    setInputValue(title || "");
  }, [title]);

  return (
    <Input
      type="text"
      placeholder="Search by title"
      value={inputValue}
      onChange={handleInputChange}
    />
  );
}