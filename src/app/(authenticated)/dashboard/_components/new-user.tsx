"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import LoadingBtn from "@/components/loading-btn";
import { z } from "zod";
import { updateUserSchema } from "@/app/types";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateFakeField } from "@/lib/funcs";
import { createUserSchema } from "@/app/types";
import { User } from "@/lib/db/schema";
import { toast } from "sonner";
import { createUser } from "@/lib/db/mutations";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export default function NewUser({
  setCreatedUserId,
}: {
  setCreatedUserId: Dispatch<SetStateAction<User["id"] | null>>;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
  });
  
  const isMobile = useIsMobile();

  const handleCreateUser = async (
    data: z.infer<typeof updateUserSchema> & { password?: string },
  ) => {
    setIsLoading(true);
    data.password = data.nationalId;
    const createdUser = await createUser({
      data: data as z.infer<typeof createUserSchema>,
      role: "user",
    });

    if (!createdUser || createdUser.error) {
      toast.error(createdUser.error);
      setIsLoading(false);
      return;
    }

    toast.message(createdUser.message);
    setCreatedUserId(createdUser.userId);
    setOpen(false);
  };

  const child = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateUser)} className="flex flex-col gap-2">
        <FormFieldWrapper form={form} name="name" label="Name" />
        <FormFieldWrapper
          defaultValue={generateFakeField("username")}
          form={form}
          name="username"
          label="Username"
        />
        <FormFieldWrapper form={form} name="email" label="Email" />
        <FormFieldWrapper
          form={form}
          name="phoneNumber"
          label="Phone Number"
        />
        <FormFieldWrapper
          form={form}
          name="nationalId"
          label="National Id"
        />
        <div className="mt-2">
          <LoadingBtn isLoading={isLoading}>Create</LoadingBtn>
        </div>
      </form>
    </Form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button className="ml-4">
            <UserPlus className="h-4 w-4" />
            New User
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-4 h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Create New User</DrawerTitle>
          </DrawerHeader>
          {child}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-4">
          <UserPlus className="h-4 w-4" />
          New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        {child}
      </DialogContent>
    </Dialog>
  );
}
