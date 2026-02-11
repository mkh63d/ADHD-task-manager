<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NCard,
  NButton,
  NModal,
  NFlex,
} from 'naive-ui';
import type { TaskType } from '../types/TaskType';

const props = defineProps<{
  show: boolean;
  task?: TaskType | null;
  defaultDate?: Date | null;
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void;
  (e: 'save', data: { title: string; description: string; dueTo: Date | null }): void;
  (e: 'delete', taskId: number): void;
}>();

const taskFormRef = ref();

const taskForm = ref({
  title: '',
  description: '',
  dueTo: null as number | null,
});

const rules = {
  title: [{ required: true, message: 'Title is required' }],
};

const isEditing = computed(() => !!props.task);

const modalTitle = computed(() => (isEditing.value ? 'Edit Task' : 'Add Task'));

// Reset form when modal opens
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      if (props.task) {
        taskForm.value = {
          title: props.task.title,
          description: props.task.description || '',
          dueTo: props.task.dueTo ? new Date(props.task.dueTo).getTime() : null,
        };
      } else {
        taskForm.value = {
          title: '',
          description: '',
          dueTo: props.defaultDate ? props.defaultDate.getTime() : null,
        };
      }
    }
  }
);

const closeModal = () => {
  emit('update:show', false);
  taskForm.value = { title: '', description: '', dueTo: null };
};

const handleSubmit = async () => {
  const formRef = taskFormRef.value;
  if (!formRef) return;

  try {
    await formRef.validate();
  } catch (validationError) {
    console.warn('Form validation failed:', validationError);
    return;
  }

  emit('save', {
    title: taskForm.value.title,
    description: taskForm.value.description,
    dueTo: taskForm.value.dueTo ? new Date(taskForm.value.dueTo) : null,
  });

  closeModal();
};

const handleDelete = () => {
  if (props.task) {
    emit('delete', props.task.task_id);
    closeModal();
  }
};
</script>

<template>
  <n-modal :show="show" @update:show="closeModal">
    <n-card :title="modalTitle" class="w-96 max-w-full m-5" closable @close="closeModal">
      <n-form
        ref="taskFormRef"
        :model="taskForm"
        :rules="rules"
        label-placement="top"
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
            :rows="3"
          />
        </n-form-item>

        <n-form-item label="Due Date & Time" path="dueTo">
          <n-date-picker
            v-model:value="taskForm.dueTo"
            type="datetime"
            clearable
            :first-day-of-week="0"
            class="w-full"
          />
        </n-form-item>

        <n-flex justify="space-between" class="mt-4">
          <n-flex>
            <n-button type="primary" @click="handleSubmit">
              {{ isEditing ? 'Update' : 'Create' }}
            </n-button>
            <n-button @click="closeModal">Cancel</n-button>
          </n-flex>
          <n-button v-if="isEditing" type="error" ghost @click="handleDelete">
            Delete
          </n-button>
        </n-flex>
      </n-form>
    </n-card>
  </n-modal>
</template>
