import { supabase } from './supabase';

export const getAccessibleOwnerIds = async (userId: string) => {
  const ownerIds = new Set<string>([userId]);

  const { data, error } = await supabase
    .from('team_members')
    .select('owner_id,status')
    .eq('member_id', userId)
    .eq('status', 'active');

  if (!error && data) {
    for (const row of data) {
      if (row.owner_id) ownerIds.add(row.owner_id);
    }
  }

  return Array.from(ownerIds);
};

export const getProjectWithAccess = async (projectId: string, userId: string) => {
  const ownerIds = await getAccessibleOwnerIds(userId);
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .in('user_id', ownerIds)
    .single();

  return { project, error };
};

export const getPrimaryOwnerId = async (userId: string) => {
  const { data: teamInfo } = await supabase
    .from('team_members')
    .select('owner_id')
    .eq('member_id', userId)
    .eq('status', 'active')
    .limit(1)
    .single();

  return teamInfo?.owner_id || userId;
};
