/**
 * Todo entity interface representing the database model
 */
export interface TodoEntity {
  id: string;
  title: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
