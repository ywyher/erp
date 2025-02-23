'use client'

import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MultipleSelector from "@/components/ui/multi-select";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldWrapperProps {
    form: {
        control: any; // Use a stricter type if possible.
        formState: {
            errors: Record<string, any>;
        };
    };
    name: string;
    label?: string;
    defaultValue?: any;
    disabled?: boolean;
    optional?: boolean;
    placeholder?: string;
    type?: "text" | "select" | 'textarea' | 'multi-select' | 'password' | 'number';
    options?: { value: string; label: string }[] | string[] | readonly string[];
    // className?: string;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
    form,
    name,
    label,
    defaultValue,
    disabled = false,
    optional = false,
    placeholder = "",
    type = "text",
    options = [],
    // className,
}) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const error = form.formState.errors[name]?.message;

    return (
        <Controller
            control={form.control}
            name={name}
            defaultValue={defaultValue ? defaultValue : ""}
            render={({ field, formState }) => (
                <FormItem className="w-full">
                    {label && (
                        <FormLabel className="capitalize">
                            {label} {optional && <span className="text-sm text-muted">(Optional)</span>}
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
                                <Textarea
                                    {...field}
                                    placeholder={placeholder}
                                    disabled={disabled}
                                />
                            )}
                            {type === "select" && (
                                <Select
                                    onValueChange={(value) => field.onChange(value)}
                                    defaultValue={field.value}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className="w-[450px]">
                                        <SelectValue placeholder={placeholder} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map((option) => {
                                            const isString = typeof option === "string";
                                            const value = isString ? option : option.value;
                                            const label = isString ? option : option.label;
                                            return (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                            {type === 'multi-select' && (
                                <MultipleSelector
                                    {...field}
                                    disabled={disabled}
                                    defaultOptions={options as { value: string; label: string }[]}
                                    placeholder={`${options.length == 0 ? `Select ${name} you like...` : ""}`}
                                    onChange={(selectedOptions) => {
                                        // Map the selected options to an array of values
                                        const selectedValues = selectedOptions.map((option) => option.value);
                                        // Call the original onChange with the array of values
                                        field.onChange(selectedValues);
                                    }}
                                    emptyIndicator={<p className="text-lg leading-10 text-center text-gray-600 dark:text-gray-400">no results found.</p>}
                                    
                                    value={
                                        (field.value || []).map((value: string) => {
                                          const option = (options as { value: string; label: string }[]).find(opt => opt.value === value);
                                          return option ? option : { value, label: value };
                                        })
                                      }
                                      
                                />
                            )}
                        </div>
                    </FormControl>
                    <FormMessage>{error}</FormMessage>
                </FormItem>
            )}
        />
    );
};