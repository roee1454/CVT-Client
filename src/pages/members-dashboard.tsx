import MembersTable from '@/components/members/members-table';
import TeamsTable from '@/components/teams/teams-table';
import { usePeople } from '@/context/people-context';

export default function MembersDashboard() {

    const { members, membersLoading, membersError, refetchMembers, teams, teamsLoading, teamsError, refetchTeams } = usePeople();

    return <div className="w-full container mx-auto space-y-8 p-6">
         <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">סדר כוח נוכחי</h1>
            <p className="text-muted-foreground">ניהול חיילים, צוותים וסדר כוח כולל</p>
        </div>
        <div className="grid grid-cols-2 jutify-items-center content-center gap-6">
            <MembersTable members={members} isLoading={membersLoading} error={membersError} refetch={refetchMembers} />  
            <TeamsTable teams={teams} isLoading={teamsLoading} error={teamsError} refetch={refetchTeams}  />
        </div>
    </div>
};