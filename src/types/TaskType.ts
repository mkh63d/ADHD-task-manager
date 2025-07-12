export interface TaskType {
  task_id: number;
  title: string;
  description: string;
  dueTo: string | null;
  importance: number | null;
  urgency: number | null;
}

