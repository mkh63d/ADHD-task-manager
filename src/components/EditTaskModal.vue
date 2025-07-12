<script lang="ts">
import { ref, defineComponent } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NFlex,
  NCard,
  NButton,
  NModal,
} from 'naive-ui';
import { TaskType } from '../types/TaskType';

export default defineComponent({
  name: 'EditTaskModal',
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
  emits: ['opened', 'updated'],

  setup(props) {
    const task = ref<TaskType>(props.task);

    const taskFormRef = ref();

    const taskForm = ref<{
      title: string;
      description: string;
      dueTo: Date | null;
    }>({
      title: '',
      description: '',
      dueTo: null,
    });

    taskForm.value = {
      title: task.value.title,
      description: task.value.description,
      dueTo: task.value.dueTo ? new Date(task.value.dueTo) : null,
    };

    const rules = {
      title: [{ required: true, message: 'Title is required' }],
    };

    return { task, taskForm, taskFormRef, rules };
  },
});
</script>

<template>
  <n-modal :show="show" @close="$emit('opened', false)">
    <n-card :title="'Edit task'" class="m-5">
      <n-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="rules"
        label-placement="left"
      >
        <n-form-item label="Task Name" path="title">
          <n-input
            v-model:value="taskForm.title"
            placeholder="Enter task name"
          />
        </n-form-item>
        <n-form-item label="Description" path="description">
          <n-input
            v-model:value="taskForm.description"
            type="textarea"
            placeholder="Enter task description"
          />
        </n-form-item>
        <n-form-item label="Due Date" path="dueTo">
          <n-date-picker
            clearable
            type="datetime"
            v-model:value="taskForm.dueTo"
            :first-day-of-week="0"
            value-format="timestamp"
          />
        </n-form-item>
        <n-button ghost type="success" @click="$emit('updated')">
          Update Task
        </n-button>
        <n-button class="ml-5" ghost type="error" @click="$emit('opened', false)"> Cancel </n-button>
      </n-form>
    </n-card>
  </n-modal>
</template>
