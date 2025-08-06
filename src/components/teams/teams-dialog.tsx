import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FaPeopleArrows } from 'react-icons/fa';
import { Team } from './teams-api';
import TeamsForm from './teams-form';

interface TeamsDialogProps {
    editingTeam: Team | null,
    open: boolean,
    onOpenChange: (open: boolean) => any
}

export default function TeamsDialog(props: TeamsDialogProps) {
    const onSuccess = () => props.onOpenChange(false);
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        <FaPeopleArrows className='w-5 h-5' />                 
                        <span>צוותים</span>
                    </DialogTitle>
                </DialogHeader>
                <TeamsForm editingTeam={props.editingTeam!} onSuccess={onSuccess} />
            </DialogContent>
        </Dialog>
    )
}