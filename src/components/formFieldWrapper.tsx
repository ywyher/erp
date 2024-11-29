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

interface FormFieldWrapperProps {
    form: {
        control: any; // Use a stricter type if possible.
        formState: {
            errors: Record<string, any>;
        };
    };
    name: string;
    label?: string;
    defaultValue?: string;
    disabled?: boolean;
    optional?: boolean;
    placeholder?: string;
    type?: "text" | "select" | 'textarea';
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
            render={({ field }) => (
                <FormItem>
                    {label && (
                        <FormLabel>
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
                        </div>
                    </FormControl>
                    <FormMessage>{error}</FormMessage>
                </FormItem>
            )}
        />
    );
};