<script setup lang="ts">
import { ref, inject } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NFlex,
  NCard,
  NButton,
} from 'naive-ui';

const supabase = inject('supabase') as any;

const taskForm = ref({
  title: '',
  description: '',
  dueDate: null,
});

const rules = {
  title: [{ required: true, message: 'Title is required' }],
};

//TODO: Create a storage for session data
const { data: { session } } = await supabase.auth.getSession();

const submitTask = async () => {
  const { error } = await supabase
    .from('tasks')
    .insert({
      title: taskForm.value.title,
      user_id: session.user.id,
      description: taskForm.value.description,
      dueTo: taskForm.value.dueDate ? new Date(taskForm.value.dueDate).toISOString() : null,
    })
    .single();

  if (error) {
    console.error('Error inserting task:', error.message);
  } else {
    console.log('Task successfully inserted:', taskForm.value);
    taskForm.value = { title: '', description: '', dueDate: null };
  }
};
</script>

<template>
  <div class="container">
    <n-card :title="'Task Manager'" class="m-5">
      <n-flex vertical align="center" justify="center" style="height: 100%">
        <h2>Create a New Task</h2>
      </n-flex>
      <n-form
        ref="taskForm"
        :model="taskForm"
        :rules="rules"
        label-placement="left"
      >
        <n-form-item label="Task Name" path="taskName">
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
        <n-form-item label="Due Date" path="dueDate">
          <n-date-picker
            clearable
            type="datetime"
            v-model:value="taskForm.dueDate"
            :first-day-of-week="0"
            value-format="timestamp"
          />
        </n-form-item>
        <n-button ghost type="success" @click="submitTask">
          Submit Task
        </n-button>
      </n-form>
    </n-card>
  </div>
</template>
