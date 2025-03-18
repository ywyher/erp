"use client";

import React, { RefObject, useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea";
import MultipleSelector from "@/components/ui/multi-select";
import { CalendarIcon, Check, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DndProvider } from "react-dnd";
import { Plate } from "@udecode/plate/react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useCreateEditor } from "@/components/editor/use-create-editor";
import { Editor, EditorContainer } from "@/components/plate-ui/editor";
import { Tag, TagInput } from "emblor";
import { Editor as TEditor, Value } from "@udecode/plate";

type AcceptMimeType =
  | "image/*"
  | "video/*"
  | "audio/*"
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

interface FormFieldWrapperProps {
  form: UseFormReturn<any, any, any>;
  name: string;
  label?: string;
  defaultValue?: string | number | string[] | Value;
  disabled?: boolean;
  optional?: boolean;
  placeholder?: string;
  accept?: AcceptMimeType;
  type?:
    | "text"
    | "select"
    | "textarea"
    | "multi-select"
    | "password"
    | "number"
    | "date"
    | "file"
    | "editor"
    | "tags";
  options?: { value: string; label: string }[] | string[] | readonly string[];
  disableSearch?: boolean
  maxLength?: number; // Add this line
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // className?: string;
  // the editor ref here to make sure content is updated since when uploading an image and the user didnt foucs on the editor it wont update it !
  editorRef?: RefObject<TEditor | null>;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  form,
  name,
  label,
  defaultValue,
  disabled = false,
  optional = false,
  placeholder = "",
  accept,
  type = "text",
  options = [],
  disableSearch = true,
  maxLength = 250,
  onFileChange,
  editorRef
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const errorMessage = form.formState.errors[name]?.message as string | undefined;
  
  let editor = null;
  if(type === 'editor' && editorRef) {
    editor = useCreateEditor({
      value: (defaultValue as Value) ? (defaultValue as Value) : []
    });
    
    editorRef.current = editor;
  }
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  useEffect(() => {
    if (defaultValue) {
      const formattedTags = defaultValue
        .toString()
        .split(",")
        .map((tag, index) => ({ id: index.toString(), text: tag.trim() }));

      setTags(formattedTags);
    }
  }, [defaultValue]);

  return (
    <Controller
      control={form.control}
      name={name}
      defaultValue={defaultValue ? defaultValue : ""}
      render={({ field, formState }) => (
        <FormItem className="w-full">
          {label && (
            <FormLabel className="capitalize">
              {label}{" "}
              {optional && (
                <span className="text-sm text-muted">(Optional)</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <div>
              {type === "text" && (
                <Input
                  {...field}
                  disabled={disabled}
                  // onChange={(e) => {
                  //     const input = e.target;
                  //     const start = input.selectionStart; // Get current cursor position
                  //     let value = input.value;

                  //     if (name === "name") {
                  //         value = value.toLowerCase(); // Lowercase without trim
                  //     } else {
                  //         value = value.trim().toLowerCase(); // Trim + lowercase for other fields
                  //     }

                  //     field.onChange(value);

                  //     // Restore cursor position
                  //     requestAnimationFrame(() => {
                  //         input.setSelectionRange(start, start);
                  //     });
                  // }}
                />
              )}
              {type === "number" && (
                <Input
                  {...field}
                  placeholder={placeholder}
                  disabled={disabled}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                    field.onChange(value);
                  }}
                />
              )}
              {type === "date" && (
                <Popover modal open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{placeholder}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(value) => {
                        field.onChange(value);
                        setOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
              {type === "password" && (
                <div className="relative w-full">
                  <Input
                    {...field}
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    disabled={disabled}
                  />
                  <button
                    type="button"
                    className="absolute text-gray-500 right-3 top-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}
              {type === "textarea" && (
                <div className="w-full">
                  <Textarea
                    {...field}
                    placeholder={placeholder}
                    disabled={disabled}
                    maxLength={maxLength}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                    }}
                  />
                  {maxLength && (
                    <div className="text-xs text-muted-foreground text-right mt-1">
                      {field.value?.length || 0}/{maxLength}
                    </div>
                  )}
                </div>
              )}
              {type === "select" && (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between capitalize"
                      disabled={disabled}
                    >
                      {field.value
                      ? (() => {
                          const option = options.find(option =>
                            typeof option === "object" ? option.value === field.value : option === field.value
                          );
                          return typeof option === "object" ? option.label : option ?? field.value;
                        })()
                      : placeholder}
                      <div className="w-full flex justify-end">
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="m-0 p-1">
                    <Command>
                      {!disableSearch && (
                        <CommandInput placeholder="Search..." />
                      )}
                      <CommandList>
                        <CommandEmpty>No option found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                              const isString = typeof option === "string";
                              const value = isString ? option : option.value;
                              const label = isString ? option : option.label;
                              return (
                                <CommandItem 
                                  key={value}
                                  value={value}
                                  onSelect={(value) => {
                                    field.onChange(value)
                                    setOpen(false)
                                  }}
                                  className="capitalize"
                                >
                                  <Check
                                    className={cn(
                                      field.value === value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {label}
                                </CommandItem>
                              );
                            })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              {type === "multi-select" && (
                <MultipleSelector
                  {...field}
                  disabled={disabled}
                  defaultOptions={options as { value: string; label: string }[]}
                  placeholder={`${options.length == 0 ? `Select ${name} you like...` : ""}`}
                  onChange={(selectedOptions) => {
                    // Map the selected options to an array of values
                    const selectedValues = selectedOptions.map(
                      (option) => option.value,
                    );
                    // Call the original onChange with the array of values
                    field.onChange(selectedValues);
                  }}
                  emptyIndicator={
                    <p className="text-lg leading-10 text-center text-gray-600 dark:text-gray-400">
                      no results found.
                    </p>
                  }
                  value={(field.value || []).map((value: string) => {
                    const option = (
                      options as { value: string; label: string }[]
                    ).find((opt) => opt.value === value);
                    return option ? option : { value, label: value };
                  })}
                />
              )}
              {type === 'file' && (
                  <Input
                    {...field}
                    disabled={disabled}
                    type="file"
                    accept={accept}
                    onChange={onFileChange}
                  />
              )}
              {(type === 'editor' && editorRef) && (
                <>
                  {editor && (
                    <DndProvider backend={HTML5Backend}>
                      <Plate
                        editor={editor}
                      >
                        <EditorContainer className="border rounded-md">
                          <Editor
                            variant={'fullWidth'}
                            onBlur={() => {
                              field.onChange(editor.children);
                            }}
                            placeholder="Type..." 
                          />
                        </EditorContainer>
                      </Plate>
                    </DndProvider>
                  )}
                </>
              )}
              {type === 'tags' && (
                <TagInput
                    placeholder="Enter a tag"
                    tags={tags}
                    setTags={(newTags) => {
                      setTags(newTags);
                      
                      const tagsArray = Array.isArray(newTags) ? newTags : tags;
                      field.onChange(tagsArray.map((tag: Tag) => tag.text));
                    }}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                />
              )}
            </div>
          </FormControl>
          <FormMessage>{errorMessage}</FormMessage>
        </FormItem>
      )}
    />
  );
};