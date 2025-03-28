"use client";

import SpecialtyFilter from "@/components/doctors/filters/specialty-filters";
import DateFilters from "@/components/date-filters";
import NameFilter from "@/components/doctors/filters/name-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

type FiltersVariant = 'default' | 'simple';

export default function DoctorsFilters({
  onApply,
  onReset,
  title = "Filter Options",
  variant = 'default',
  className = "",
}: {
  onApply: () => void;
  onReset?: () => void;
  title?: string
  variant?: FiltersVariant;
  className?: string,
}) {
  return (
    <Card>
      {title && (
        <CardHeader className="pb-1">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent 
        className={clsx(
          "flex flex-col lg:flex-row gap-4 w-full p-5",
          className
        )}
      >
        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
          <NameFilter />
          <SpecialtyFilter />
          
          {variant === 'default' && (
            <>
              <DateFilters />
            </>
          )}
        </div>
        <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
          <Button onClick={onApply} className="w-full lg:w-auto">
            Search
          </Button>
          
          {(variant === 'default' && onReset) && (
            <Button onClick={onReset} className="w-full lg:w-auto">
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}