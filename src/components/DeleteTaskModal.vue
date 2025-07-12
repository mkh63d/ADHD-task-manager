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
  emite: ['opened', 'delete'],

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
      <n-button type="error" @click="$emit('delete')">Yes, delete</n-button>
      <n-button @click="$emit('opened', false)">Cancel</n-button>
    </n-card>
  </n-modal>
</template>
