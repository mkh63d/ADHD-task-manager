import { ref, inject } from 'vue';
import type { TaskType } from '../types/TaskType';

export function useTasks() {
  const supabase = inject('supabase') as any;
  const tasks = ref<TaskType[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getSession = async () => {
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      error.value = sessionError.message;
      return null;
    }
    return data.session;
  };

  const fetchTasks = async () => {
    loading.value = true;
    error.value = null;

    const session = await getSession();
    if (!session) {
      loading.value = false;
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', session.user.id);

    if (fetchError) {
      error.value = fetchError.message;
    } else {
      tasks.value = data || [];
    }

    loading.value = false;
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    dueTo?: Date | null;
  }) => {
    error.value = null;

    const session = await getSession();
    if (!session) return false;

    const { error: insertError } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        user_id: session.user.id,
        description: taskData.description || '',
        dueTo: taskData.dueTo ? new Date(taskData.dueTo).toISOString() : null,
      })
      .single();

    if (insertError) {
      error.value = insertError.message;
      return false;
    }

    await fetchTasks();
    return true;
  };

  const updateTask = async (
    taskId: number,
    taskData: {
      title?: string;
      description?: string;
      dueTo?: Date | string | null;
    }
  ) => {
    error.value = null;

    const updatePayload: Record<string, any> = {};
    if (taskData.title !== undefined) updatePayload.title = taskData.title;
    if (taskData.description !== undefined)
      updatePayload.description = taskData.description;
    if (taskData.dueTo !== undefined) {
      updatePayload.dueTo = taskData.dueTo
        ? new Date(taskData.dueTo).toISOString()
        : null;
    }

    const { error: updateError } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('task_id', taskId)
      .single();

    if (updateError) {
      error.value = updateError.message;
      return false;
    }

    await fetchTasks();
    return true;
  };

  const deleteTask = async (taskId: number) => {
    error.value = null;

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('task_id', taskId)
      .single();

    if (deleteError) {
      error.value = deleteError.message;
      return false;
    }

    await fetchTasks();
    return true;
  };

  const moveTask = async (taskId: number, newDate: Date) => {
    return updateTask(taskId, { dueTo: newDate });
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.value.filter((task) => {
      if (!task.dueTo) return false;
      const taskDateStr = new Date(task.dueTo).toISOString().split('T')[0];
      return taskDateStr === dateStr;
    });
  };

  const getTasksWithoutDate = () => {
    return tasks.value.filter((task) => !task.dueTo);
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksForDate,
    getTasksWithoutDate,
  };
}
