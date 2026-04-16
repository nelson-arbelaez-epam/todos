import type { TodoDto } from '@todos/core/http';
import Button from '../../atoms/Button/Button';
import Checkbox from '../../atoms/Checkbox/Checkbox';

export interface TodoItemProps {
  todo: TodoDto;
  isUpdating?: boolean;
  onToggleComplete?: (todo: TodoDto) => void;
  onStartEdit?: (todo: TodoDto) => void;
}

const TodoItem = ({
  todo,
  isUpdating = false,
  onToggleComplete,
  onStartEdit,
}: TodoItemProps) => (
  <article className="flex items-start gap-3 p-3 border-b">
    <Checkbox
      checked={todo.completed}
      onChange={() => onToggleComplete?.(todo)}
      aria-label={todo.completed ? `Mark "${todo.title}" as active` : `Mark "${todo.title}" as complete`}
      disabled={isUpdating}
    />
    <div className="flex-1">
      <div
        className={`font-medium ${todo.completed ? 'line-through text-muted' : 'text-text'}`}
      >
        {todo.title}
      </div>
      {todo.description && (
        <div className="text-sm text-muted">{todo.description}</div>
      )}
    </div>
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        variant={todo.completed ? 'secondary' : 'primary'}
        onClick={() => onToggleComplete?.(todo)}
        disabled={isUpdating}
        aria-label={todo.completed ? `mark-active-${todo.id}` : `complete-${todo.id}`}
      >
        {todo.completed ? 'Mark active' : 'Complete'}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onStartEdit?.(todo)}
        disabled={isUpdating}
        aria-label={`edit-${todo.id}`}
      >
        Edit
      </Button>
    </div>
  </article>
);

export default TodoItem;
