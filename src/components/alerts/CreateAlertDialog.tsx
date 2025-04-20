
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlert, AlertComparison, CreateAlertPayload } from "@/services/apiService";

interface CreateAlertDialogProps {
  tokenSymbol: string;
  tokenName: string;
  currentPrice: number;
  mint: string;
}

const MOCK_USER_EMAIL = "user@example.com"; 

export default function CreateAlertDialog({ tokenSymbol, tokenName, currentPrice, mint }: CreateAlertDialogProps) {
  const [threshold, setThreshold] = useState(currentPrice.toString());
  const [comparison, setComparison] = useState<AlertComparison>("GREATER_THAN");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createAlert,
    onSuccess: (data) => {
      toast({
        title: "Alert Created Successfully",
        description: `Alert ID: ${data.alertId}. You'll be notified when ${tokenSymbol} price is ${comparison === 'GREATER_THAN' ? '>' : '<'} ${threshold}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['userAlerts'] });
      setOpen(false); 
    },
    onError: (error) => {
      toast({
        title: "Error Creating Alert",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateAlertPayload = {
      userEmail: MOCK_USER_EMAIL, 
      mint: mint, 
      parameter: "price", 
      comparison: comparison,
      threshold: parseFloat(threshold),
    };
    mutate(payload);
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
          <DialogDescription>
            Current Price: ${currentPrice.toFixed(6)}. We'll notify you when the condition is met.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="comparison" className="col-span-1">Condition</Label>
            <Select 
              value={comparison}
              onValueChange={(value: string) => setComparison(value as AlertComparison)}
            >
              <SelectTrigger id="comparison" className="col-span-2">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GREATER_THAN">Price is Greater Than</SelectItem>
                <SelectItem value="LESS_THAN">Price is Less Than</SelectItem>
                {/* <SelectItem value="EQUALS">Price Equals</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="threshold" className="col-span-1">Threshold Price ($)</Label>
            <Input
              id="threshold"
              type="number"
              step="any" 
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
              className="col-span-2"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                "Create Alert"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
