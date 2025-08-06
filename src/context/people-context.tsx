import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { MembersAPI } from "@/components/members/members-api";
import { Team, TeamsAPI } from "@/components/teams/teams-api";
import { Member } from "@/types";

interface PeopleContextProps {
    members: Member[] | undefined,
    membersLoading: boolean,
    membersError: unknown,
    refetchMembers: () => any,
    teams: Team[] | undefined,
    teamsLoading: boolean,
    teamsError: unknown,
    refetchTeams: () => any,
}

export const PeopleContext = createContext<PeopleContextProps>({ 
    members: undefined,
    membersLoading: false,
    membersError: undefined,
    refetchMembers: () => {},
    teams: undefined,
    teamsLoading: false,
    teamsError: undefined,
    refetchTeams: () => {}
 });

export  function PeopleProvider({ children }: { children: ReactNode }) {
    const { data: members, isLoading: membersLoading, error: membersError, refetch: refetchMembers } = useQuery({
            queryKey: ['members'],
            queryFn: MembersAPI.list
        });
    
    const { data: teams, isLoading: teamsLoading, error: teamsError, refetch: refetchTeams } = useQuery({
        queryKey: ['teams'],
        queryFn: TeamsAPI.list
    })
    
    return <PeopleContext.Provider value={{ members, membersLoading, membersError, refetchMembers, teams, teamsLoading, teamsError, refetchTeams }}>{ children }</PeopleContext.Provider>
}

export function usePeople() {
    return useContext(PeopleContext);
}