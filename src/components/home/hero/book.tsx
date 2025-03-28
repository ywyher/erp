"use client"

import DoctorsFilters from "@/components/doctors/filters";
import { useRouter } from "next/navigation";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

export default function Book() {
    const router = useRouter();
    const [specialties] = useQueryState(
        "specialties",
        parseAsArrayOf(parseAsString),
    );
    const [name] = useQueryState("name");
  
    const handleApplyFilters = () => {
      // Construct the query string manually
      const queryParams = new URLSearchParams();
      
      if (specialties) {
        queryParams.append("specialties", specialties.join(','));
      }
      if (name) {
        queryParams.append("name", name);
      }
  
      // Redirect to /booking with the current filter parameters
      router.push(`/booking?${queryParams.toString()}`);
    };
  
    return (
        <DoctorsFilters
            onApply={handleApplyFilters} 
            variant='simple'
            title="Find a doctor"
            className='p-3'
        />
    );
}