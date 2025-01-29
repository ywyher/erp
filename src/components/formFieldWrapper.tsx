import React from "react";
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
    type?: "text" | "select" | 'textarea' | 'multi-select';
    options?: { value: string; label: string }[] | string[] | readonly string[];
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
}) => {
    const error = form.formState.errors[name]?.message;

    return (
        <Controller
            control={form.control}
            name={name}
            defaultValue={defaultValue ? defaultValue : ""}
            render={({ field, formState }) => (
                <FormItem>
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
                                    placeholder={placeholder}
                                    disabled={disabled}
                                />
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
                                    defaultOptions={options as { value: string; label: string }[]}
                                    placeholder={`${options.length == 0 ? `Select ${name} you like...` : ""}`}
                                    onChange={(selectedOptions) => {
                                        // Map the selected options to an array of values
                                        const selectedValues = selectedOptions.map((option) => option.value);
                                        // Call the original onChange with the array of values
                                        field.onChange(selectedValues);
                                    }}
                                    emptyIndicator={<p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">no results found.</p>}
                                    
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