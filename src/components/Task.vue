<script lang="ts">
import { ref, defineComponent, inject } from 'vue';
import { NCard } from 'naive-ui';
import { TaskType } from '../types/TaskType';
import DeleteTaskModal from './DeleteTaskModal.vue';

export default defineComponent({
  name: 'Task',
  props: {
    task: {
      type: Object as () => TaskType,
      required: true,
    },
  },
  emits: ['deletedOrUpdated'],
  setup(props, { emit }) {
    const task = props.task;
    const supabase = inject('supabase') as any;
    const openDeleteModal = ref(false);

    //Update the task visibility state
    const updateShow = (value: boolean) => {
      openDeleteModal.value = value;
    };

    const deleteTask = async () => {
      if (!task) {
        console.error('No task to delete');
        return;
      }

      console.log('Deleting task:', task.task_id);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', task.task_id)
        .single();

      if (error) {
        console.error('Error deleting task:', error.message);
      }

      emit('deletedOrUpdated')
      openDeleteModal.value = false;
    };

    return { task, deleteTask, openDeleteModal, updateShow };
  },
});
</script>

<style scoped>
.n-card {
  max-width: 300px;
}
</style>

<template>
  <n-modal-provider>
    <DeleteTaskModal
      v-model:show="openDeleteModal"
      :task="task"
      @delete="deleteTask"
      @opened="updateShow"
    />
  </n-modal-provider>
  <n-card
    medium
    :title="task.title"
    :segmented="{
      content: true,
    }"
    closable
    @close="openDeleteModal = true"
  >
    <p>{{ task.description }}</p>
    <p>Due: {{ task.dueTo }}</p>
    <p>Importance: {{ task.importance }}</p>
    <p>Urgency: {{ task.urgency }}</p>
  </n-card>
</template>
