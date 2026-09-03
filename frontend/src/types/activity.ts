export type ActionType = 
  | 'UPLOAD_FILE' 
  | 'DOWNLOAD_FILE' 
  | 'DELETE_FILE' 
  | 'CREATE_FOLDER' 
  | 'DELETE_FOLDER'
  | 'RENAME_FILE' 
  | 'MOVE_FILE' 
  | 'SHARE_FILE' 
  | 'RESTORE_VERSION'
  | 'USER_LOGIN'
  | 'UPDATE_PROFILE';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: ActionType;
  details: string;
  targetName: string;
  targetId?: string;
  timestamp: string;
  ipAddress?: string;
  provider?: 'AZURE' | 'GCP';
}
