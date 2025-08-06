import { Plus } from "lucide-react";
import { System } from "./systems-api";
import SystemForm from "./systems-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'


interface SystemDialogProps {
    editingSystem?: System | null,
    onOpenChange: (open: boolean) => void,
    open: boolean
}

export default function SystemDialog({ editingSystem, onOpenChange, open }: SystemDialogProps) {
    const handleSuccess = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {editingSystem ? 'עריכת מערכת' : 'הוספת מערכת חדשה'}
                    </DialogTitle>
                </DialogHeader>
                <SystemForm editingSystem={editingSystem!} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    );
}