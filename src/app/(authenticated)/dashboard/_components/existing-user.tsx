"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { searchUsers } from "@/lib/db/queries";
import { User } from "@/lib/db/schema";
import { useDebounce } from "use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import NewUser from "@/app/(authenticated)/dashboard/_components/new-user";

export default function ExistingUser({
  setSelectedUserId,
  newUser = false,
  title,
}: {
  setSelectedUserId: Dispatch<SetStateAction<User["id"] | null>>;
  newUser?: boolean;
  title: string;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchUsers(query, "all");
      setSearchResults(results);
    } catch (error) {
      toast.error(`Error searching patients, Please try again later.`);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery.trim() !== "") {
      handleSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const handlePatientSelection = (patient: User) => {
    setSelectedUserId(patient.id);
    setSearchQuery("");
    setIsSearching(false);
  };

  return (
    <Card className="w-full h-full mt-5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Search for existing users or create a new user
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1">
              <Input
                placeholder={`Search for existing patients`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {newUser && <NewUser setCreatedUserId={setSelectedUserId} />}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.length > 0 ? (
                  searchResults.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>{user.phoneNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40" align="end">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => {
                                handlePatientSelection(user);
                              }}
                            >
                              Select
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {debouncedSearchQuery.trim() === ""
                        ? "Enter a search query to find patients."
                        : "No results found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
