import type { TodoDto } from '@todos/core/http';

export interface TodoItemProps {
  todo: TodoDto;
}

const TodoItem = ({ todo }: TodoItemProps) => (
  <article className="flex items-start gap-3 p-3 border-b">
    <input
      type="checkbox"
      checked={todo.completed}
      readOnly
      aria-label={`completed-${todo.id}`}
      className="mt-1"
    />
    <div>
      <div className="font-medium text-text">{todo.title}</div>
      {todo.description && (
        <div className="text-sm text-muted">{todo.description}</div>
      )}
    </div>
  </article>
);

export default TodoItem;
