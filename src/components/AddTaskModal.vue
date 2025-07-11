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
  NModal
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
const session = ref<any>(null);

onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  session.value = data.session;
})

const submitTask = async () => {
  const { error } = await supabase
    .from('tasks')
    .insert({
      title: taskForm.value.title,
      user_id: session.value.user.id,
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

const showModal = ref(false);
</script>

<template>
  <n-modal v-model:show="showModal" @close="showModal = false">
    <n-card :title="'Add task '" class="m-5">
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
  </n-modal>
</template>

