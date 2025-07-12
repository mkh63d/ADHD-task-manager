<script lang="ts">
import { ref, inject, defineComponent } from 'vue';
import { TaskType } from '../types/TaskType';

export default defineComponent({
  name: 'DeleteTaskModal',
  props: {
    task: {
      type: Object as () => TaskType,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
  },
  emite: ['opened', 'deleted'],

  setup(props, { emit }) {
    const task = ref<TaskType>(props.task);
    const supabase = inject('supabase') as any;

    const deleteTask = async () => {
      if (!task.value) {
        console.error('No task to delete');
        return;
      }

      console.log('Deleting task:', task.value.task_id);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', task.value.task_id)
        .single();

      if (error) {
        console.error('Error deleting task:', error.message);
      } else {
        console.log('Task successfully deleted:', task.value);
        emit('deleted');
        emit('opened', false);
      }
    };

    return { task, close, deleteTask };
  },
});
</script>

<template>
  <n-modal :show="show" @close="close">
    <n-card title="Delete Task" :segmented="{ content: true }">
      <p>Are you sure you want to delete this task?</p>
      <n-button type="error" @click="deleteTask">Yes, delete</n-button>
      <n-button @click="$emit('opened', false)">Cancel</n-button>
    </n-card>
  </n-modal>
</template>
