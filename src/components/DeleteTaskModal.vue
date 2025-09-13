<script lang="ts">
import { ref, defineComponent } from 'vue';
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
  emits: ['opened', 'delete'],

  setup(props) {
    const task = ref<TaskType>(props.task);

    return { task };
  },
});
</script>

<template>
  <n-modal :show="show" @close="$emit('opened', false)">
    <n-card title="Delete Task" :segmented="{ content: true }">
      <p>Are you sure you want to delete this task?</p>
      <n-space class="mt-4">
        <n-button type="error"
ghost @click="$emit('delete')"
          >Yes, delete</n-button
        >
        <n-button class="ml-3"
ghost @click="$emit('opened', false)"
          >Cancel</n-button
        >
      </n-space>
    </n-card>
  </n-modal>
</template>
