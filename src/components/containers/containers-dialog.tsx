import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Plus } from 'lucide-react';
import ContainersForm from './containers-form';
import { Software } from '../software/software-api';

interface SoftwareDialogProps {
    software: Software[],
    isLoading: boolean,
    error: Error | null,
    open: boolean,
    onOpenChange: (open: boolean) => any;
}

export default function ContainerDialog({ software, isLoading, error, open, onOpenChange }: SoftwareDialogProps) {
    
    function handleSubmit() {
        onOpenChange(false);
    }
    
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className='w-5 h-5' />
                        <span>הוספת קונטיינר</span>
                    </DialogTitle>
                </DialogHeader>
                <ContainersForm software={software} isLoading={isLoading} error={error} handleSubmit={handleSubmit} />
            </DialogContent>
        </Dialog>
    )
}