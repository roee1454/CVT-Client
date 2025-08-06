import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User2Icon } from 'lucide-react';
import MembersForm from './members-form';
import { Member } from '@/types';

interface MembersDialogProps {
    editingMember: Member | null,
    open: boolean,
    onOpenChange: (open: boolean) => any
};

export default function MembersDialog({ open, onOpenChange, editingMember }: MembersDialogProps) {
    const handleSuccess = () => {
        onOpenChange(false);
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        <User2Icon />
                        <span>כוח אדם רלוונטי להיום</span>
                    </DialogTitle>
                </DialogHeader>
                <MembersForm editingMember={editingMember} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}