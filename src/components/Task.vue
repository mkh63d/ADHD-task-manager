<script lang="ts">
import { ref, defineComponent, inject } from 'vue';
import { NCard, NButton, NIcon, NSpace } from 'naive-ui';
import { TaskType } from '../types/TaskType';
import DeleteTaskModal from './DeleteTaskModal.vue';
import { Edit, Trash } from '@vicons/tabler';
import EditTaskModal from './EditTaskModal.vue';

export default defineComponent({
  name: 'Task',
  components: {
    Edit,
    Trash,
    DeleteTaskModal,
    EditTaskModal,
  },
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
    const openEditModal = ref(false);

    //Update the task visibility state
    const updateDeleteModalVisibility = (value: boolean) => {
      openDeleteModal.value = value;
    };

    const updateEditModalVisibility = (value: boolean) => {
      openEditModal.value = value;
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

      emit('deletedOrUpdated');
      openDeleteModal.value = false;
    };

    const updateTask = async () => {
      if (!task) {
        console.error('No task to update');
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          description: task.description,
          dueTo: task.dueTo ? new Date(task.dueTo).toISOString() : null,
        })
        .eq('task_id', task.task_id)
        .single();

      if (error) {
        console.error('Error updating task:', error.message);
      } else {
        emit('deletedOrUpdated');
        openEditModal.value = false;
      }
    };

    return {
      task,
      deleteTask,
      openDeleteModal,
      updateDeleteModalVisibility,
      openEditModal,
      updateEditModalVisibility,
      updateTask,
      Edit,
      Trash,
    };
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
      @opened="updateDeleteModalVisibility"
    />
    <EditTaskModal
      v-model:show="openEditModal"
      :task="task"
      @updated="updateTask"
      @opened="updateEditModalVisibility"
    />
  </n-modal-provider>
  <n-card
    medium
    :title="task.title"
    :segmented="{
      content: true,
    }"
  >
    <template #header-extra>
      <n-space class="gap-2 ml-3 justify-items-end">
        <n-button
          type="primary"
          strong
          secondary
          circle
          @click="openEditModal = true"
        >
          <template #icon>
            <n-icon size="20">
              <Edit />
            </n-icon>
          </template>
        </n-button>
        <n-button
          type="error"
          strong
          secondary
          circle
          @click="openDeleteModal = true"
        >
          <template #icon>
            <n-icon size="20">
              <Trash />
            </n-icon>
          </template>
        </n-button>
      </n-space>
    </template>
    <p>{{ task.description }}</p>
    <p>Due: {{ task.dueTo }}</p>
    <p>Importance: {{ task.importance }}</p>
    <p>Urgency: {{ task.urgency }}</p>
  </n-card>
</template>
