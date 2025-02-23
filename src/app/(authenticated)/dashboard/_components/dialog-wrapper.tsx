import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Dispatch, SetStateAction } from "react";

export default function DialogWrapper({ 
   children,
   open,
   setOpen,
   label,
   operation,
  }: { 
     children: React.ReactNode;
     open: boolean;
     setOpen: Dispatch<SetStateAction<boolean>>;
     label: string;
     operation: 'create' | 'update'
  }) {
  return (
      <div className={`${operation == 'create' && `flex items-end justify-start w-full h-screen`}`}>
          <div className={`${operation == 'create' && `sticky bottom-0 w-full p-4 shadow-md`}`}>
              <Button onClick={() => setOpen(true)} className="w-full capitalize">
                {operation == 'create' ? (
                    <>
                        Create {label == 'admin' ? "An" : 'A'} {label}
                    </>
                ): (
                    <>Update</>
                )}
              </Button>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                  <DialogHeader>
                      <DialogTitle className="capitalize">Create New {label}</DialogTitle>
                      <DialogDescription>
                          Fill out the form below to create a new user. All fields are required.
                      </DialogDescription>
                  </DialogHeader>
                  {children}
              </DialogContent>
          </Dialog>
      </div>
  );
}