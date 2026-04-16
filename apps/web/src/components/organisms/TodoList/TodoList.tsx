import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import TodoItem from '../../molecules/todo-item/TodoItem';
import EditTodoForm from '../EditTodoForm/EditTodoForm';

export interface TodoListProps {
  todos: TodoDto[];
  updating?: Record<string, boolean>;
  updateErrors?: Record<string, string | null>;
  editingTodoId?: string | null;
  onToggleComplete?: (todo: TodoDto) => void;
  onStartEdit?: (todo: TodoDto) => void;
  onCancelEdit?: () => void;
  onSubmitEdit?: (id: string, payload: UpdateTodoDto) => Promise<void>;
  onArchive?: (todo: TodoDto) => void;
}

const TodoList = ({
  todos,
  updating = {},
  updateErrors = {},
  editingTodoId,
  onToggleComplete,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onArchive,
}: TodoListProps) => {
  if (!todos || todos.length === 0) {
    return <div>No todos</div>;
  }

  return (
    <ul className="divide-y divide-muted">
      {todos.map((t) => {
        const isEditing = editingTodoId === t.id;
        const isUpdating = !!updating[t.id];

        return (
          <li key={t.id}>
            {isEditing && onSubmitEdit && onCancelEdit ? (
              <EditTodoForm
                todo={t}
                isUpdating={isUpdating}
                updateError={updateErrors[t.id] ?? null}
                onSubmit={onSubmitEdit}
                onCancel={onCancelEdit}
              />
            ) : (
              <TodoItem
                todo={t}
                isUpdating={isUpdating}
                onToggleComplete={onToggleComplete}
                onStartEdit={onStartEdit}
                onArchive={onArchive}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default TodoList;
