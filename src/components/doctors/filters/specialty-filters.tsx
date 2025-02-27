"use client";

import { specialties as specialtiesArr } from "@/app/(authenticated)/dashboard/constants";
import { useQueryState, parseAsArrayOf, parseAsString } from "nuqs";
import MultipleSelector from "@/components/ui/multi-select";

export default function SpecialtiesFilter() {
  const [specialties, setSpecialties] = useQueryState(
    "specialties",
    parseAsArrayOf(parseAsString),
  );

  const handleSpecialtiesChange = (
    selectedOptions: { value: string; label: string }[],
  ) => {
    setSpecialties(selectedOptions.map((option) => option.value));
  };

  const specialtiesOptions = specialtiesArr.map((s) => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  }));
  const selectedSpecialties =
    specialties?.map((s) => ({
      value: s,
      label: s.charAt(0).toUpperCase() + s.slice(1),
    })) || [];

  return (
    <MultipleSelector
      className="w-full"
      options={specialtiesOptions}
      value={selectedSpecialties}
      onChange={handleSpecialtiesChange}
      placeholder="Select specialties"
    />
  );
}
