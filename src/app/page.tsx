"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";


const Page = () => {
  const [value, setValue] = useState("");

  const trpc = useTRPC();
  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess: () => {
      toast.success("Message created!")
    }
  }));

  return (
    <div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button 
      disabled={createMessage.isPending}
      onClick={() => createMessage.mutate({ value: value })}
      >
        Invoke Background Job
      </Button>
    </div>
  )
}


export default Page;