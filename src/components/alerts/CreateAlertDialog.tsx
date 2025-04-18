
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

interface CreateAlertDialogProps {
  tokenSymbol: string;
  tokenName: string;
  currentPrice: number;
}

export default function CreateAlertDialog({ tokenSymbol, tokenName, currentPrice }: CreateAlertDialogProps) {
  const [price, setPrice] = useState(currentPrice.toString());
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock creating an alert
    toast({
      title: "Alert Created",
      description: `You will be notified when ${tokenSymbol} reaches $${price}`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bell className="mr-2 h-4 w-4" />
          Set Price Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price Alert for {tokenName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateAlert} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Alert me when price reaches</Label>
            <Input
              id="price"
              type="number"
              step="0.000001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Create Alert
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
