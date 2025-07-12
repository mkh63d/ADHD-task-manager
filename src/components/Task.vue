<script lang="ts">
import { ref, defineComponent } from 'vue';
import { NCard } from 'naive-ui';
import { TaskType } from '../types/TaskType';

const openDeleteModal = ref(false);

export default defineComponent({
  name: 'Task',
  props: {
    task: {
      type: Object as () => TaskType,
      required: true,
    },
  },
  emite: ['deletedOrUpdated'],
  setup(props) {
    const task = ref<TaskType>(props.task);

    //Update the task visibility state
    const updateShow = (value: boolean) => {
      openDeleteModal.value = value;
    };

    return { task, openDeleteModal, updateShow };
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
      @deleted="$emit('deletedOrUpdated')"
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
