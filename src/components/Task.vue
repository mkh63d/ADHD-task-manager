<script lang="ts">
import { ref, defineComponent } from 'vue';
import { NCard } from 'naive-ui';

interface TaskType {
  title: string;
  description: string;
  dueDate: string | null;
  importance: number | null;
  urgency: number | null;
}

export default defineComponent({
  name: 'Task',
  props: {
    task: {
      type: Object as () => TaskType,
      required: true,
    },
  },
  setup(props) {
    const task = ref<TaskType>(props.task);
    return { task };
  },
});
</script>

<style scoped>
.n-card {
  max-width: 300px;
}
</style>

<template>
  <n-card
    medium
    :title="task.title"
    :segmented="{
      content: true,
    }"
  >
    <p>{{ task.description }}</p>
    <p>Due: {{ task.dueDate }}</p>
    <p>Importance: {{ task.importance }}</p>
    <p>Urgency: {{ task.urgency }}</p>
  </n-card>
</template>
