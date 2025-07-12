<script setup lang="ts">
import { ref, inject, onMounted } from 'vue';
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

const supabase = inject('supabase') as any;

const emit = defineEmits(['submitted']);

const taskFormRef = ref();

const taskForm = ref({
  title: '',
  description: '',
  dueTo: null,
});

const rules = {
  title: [{ required: true, message: 'Title is required' }],
};

//TODO: Create a storage for session data
const session = ref<any>(null);

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  session.value = data.session;
});

const submitTask = async () => {
  const formRef = taskFormRef.value;
  if (!formRef) return;

  try {
    await formRef.validate();
  } catch (validationError) {
    console.warn('Form validation failed:', validationError);
    return;
  }

  const { error } = await supabase
    .from('tasks')
    .insert({
      title: taskForm.value.title,
      user_id: session.value.user.id,
      description: taskForm.value.description,
      dueTo: taskForm.value.dueTo
        ? new Date(taskForm.value.dueTo).toISOString()
        : null,
    })
    .single();

  if (error) {
    console.error('Error inserting task:', error.message);
    return;
  }

  emit('submitted');
  taskForm.value = { title: '', description: '', dueTo: null };
};

const showModal = ref(false);
</script>

<template>
  <n-modal v-model:show="showModal" @close="showModal = false">
    <n-card :title="'Add task '" class="m-5">
      <n-flex vertical align="center" justify="center" style="height: 100%">
        <h2>Create a New Task</h2>
      </n-flex>
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
        <n-button ghost type="success" @click="submitTask">
          Submit Task
        </n-button>
      </n-form>
    </n-card>
  </n-modal>
</template>
