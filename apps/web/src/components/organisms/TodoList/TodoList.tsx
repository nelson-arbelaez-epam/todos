import type { TodoDto } from '@todos/core/http';
import TodoItem from '../../molecules/todo-item/TodoItem';

export interface TodoListProps {
  todos: TodoDto[];
}

const TodoList = ({ todos }: TodoListProps) => {
  if (!todos || todos.length === 0) {
    return <div>No todos</div>;
  }

  return (
    <ul className="divide-y divide-muted">
      {todos.map((t) => (
        <li key={t.id}>
          <TodoItem todo={t} />
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
