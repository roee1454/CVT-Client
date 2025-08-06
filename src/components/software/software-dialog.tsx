import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus } from "lucide-react";
import { Software } from "./software-api";
import SoftwareForm from "./software-form";

export default function SoftwareDialog({ editingSoftware, onOpenChange, open }: {
    editingSoftware?: Software | null,
    onOpenChange: (open: boolean) => void,
    open: boolean
}) {
    const handleSuccess = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {editingSoftware ? 'עריכת תוכנה' : 'הוספת תוכנה חדשה'}
                    </DialogTitle>
                </DialogHeader>
                <SoftwareForm 
                    editingSoftware={editingSoftware} 
                    onSuccess={handleSuccess} 
                />
            </DialogContent>
        </Dialog>
    );
}