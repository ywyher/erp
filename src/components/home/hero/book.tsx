"use client"
import DoctorsFilters from "@/components/doctors/filters";
import { useRouter } from "next/navigation";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { Suspense } from "react";

// Create a separate client component for the filters 
function BookingFilters() {
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

// Create a loading fallback component
function BookingFiltersLoading() {
  return (
    <div className="p-3">
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function Book() {
  return (
    <Suspense fallback={<BookingFiltersLoading />}>
      <BookingFilters />
    </Suspense>
  );
}