export interface UserDocument {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  content_type: string;
  settlement_step_id: number | null;
  user_id: number;
  created_at: string;
  download_url: string;
}
