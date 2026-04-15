import type { TodoDto, UpdateTodoDto } from '@todos/core/http';
import { useEffect, useState } from 'react';
import { CreateTodoForm } from '@/components/organisms';
import { ScreenLayout, TodoList } from '@/components/templates';
import { useTodos } from '@/hooks/useTodos';

export function TodosScreen() {
  const {
    todos,
    isLoading,
    isCreating,
    updating,
    error,
    createError,
    updateError,
    refresh,
    createTodo,
    updateTodo,
    lastUpdatedTodoId,
  } = useTodos();
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleStartEdit = (todo: TodoDto) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description ?? '');
    setEditError(null);
    // Clear updateError on edit start
    // (handled by useTodos, but can also clear local error state here if needed)
  };
  // Clear updateError when editing a different todo
  useEffect(() => {
    if (
      editingTodoId &&
      lastUpdatedTodoId &&
      editingTodoId !== lastUpdatedTodoId
    ) {
      // Optionally clear updateError here if desired
      // setUpdateError(null); // Not available directly, but can be handled in hook if needed
    }
  }, [editingTodoId, lastUpdatedTodoId]);

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditTitle('');
    setEditDescription('');
    setEditError(null);
  };

  const handleSubmitEdit = async (id: string, payload: UpdateTodoDto) => {
    const trimmedTitle = (payload.title ?? '').trim();
    const trimmedDescription = (payload.description ?? '').trim();

    if (!trimmedTitle) {
      setEditError('Title is required.');
      return;
    }

    setEditError(null);
    const updated = await updateTodo(id, {
      title: trimmedTitle,
      description: trimmedDescription || undefined,
    });

    if (updated) {
      handleCancelEdit();
    }
  };

  return (
    <ScreenLayout>
      <CreateTodoForm
        onSubmit={createTodo}
        isLoading={isCreating}
        errorMessage={createError}
      />
      <TodoList
        todos={todos}
        isLoading={isLoading}
        error={error}
        onRefresh={refresh}
        updating={updating}
        updateError={updateError}
        editingTodoId={editingTodoId}
        editTitle={editTitle}
        editDescription={editDescription}
        editError={editError}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onChangeEditTitle={setEditTitle}
        onChangeEditDescription={setEditDescription}
        onSubmitEdit={handleSubmitEdit}
        onToggleComplete={async (todo) => {
          await updateTodo(todo.id, { completed: !todo.completed });
        }}
      />
    </ScreenLayout>
  );
}

export default TodosScreen;
