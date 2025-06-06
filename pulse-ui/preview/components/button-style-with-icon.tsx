import { Button } from "@/components/retroui/Button";
import { Trash } from "lucide-react";

export default function ButtonStyleSecondary() {
  return (
    <Button className="bg-destructive text-white hover:bg-destructive/90">
      <Trash className="h-4 w-4 mr-2" /> Delete
    </Button>
  );
}
