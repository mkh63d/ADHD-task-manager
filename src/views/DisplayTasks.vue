<script setup lang="ts">
import Task from '../components/Task.vue';
import { supabase } from '../services/supabase';
import { NButton, NModalProvider } from 'naive-ui';
import { ref, onMounted } from 'vue';
import AddTaskModal from '../components/AddTaskModal.vue';
import { TaskType } from '../types/TaskType';

//TODO: Create a storage for session data
const session = ref<any>(null);
const tasks = ref<TaskType[]>([]);
const showModal = ref(false);

// Function to handle task submission
const taskSubmitted = () => {
  showModal.value = false;
  fetchTasks();
};

// Function to handle sign out
const signOut = async () => {
  await supabase.auth.signOut();
  window.location.href = '/loginPanel';
};

onMounted(async () => {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  session.value = sessionData.session;

  if (sessionError) {
    console.error('Error fetching session:', sessionError.message);
    return;
  }

  await fetchTasks();
});

const fetchTasks = async () => {
  if (!session.value) {
    console.error('Session is not available');
    return;
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', session.value.user.id);

  if (error) {
    console.error('Error fetching tasks:', error.message);
  } else {
    tasks.value = data || [];
  }
};
</script>

<template>
  <div class="container">
    <n-modal-provider>
      <AddTaskModal v-model:show="showModal" @submitted="taskSubmitted" />
    </n-modal-provider>
    <n-card class="m-5">
      <n-flex vertical align="center" justify="center" style="height: 100%">
        <h1 class="text-2xl font-bold mb-4">Your Tasks</h1>
        <n-button
          ghost
          type="primary"
          @click="
            () => {
              showModal = true;
            }
          "
          class="justify-self-end align-top"
          >Add task</n-button
        >
        <div v-if="tasks.length === 0" class="text-white text-center">
          No tasks available.
        </div>
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Task
            v-for="task in tasks"
            :key="task.task_id"
            :task="task"
            @deletedOrUpdated="fetchTasks"
          />
        </div>
      </n-flex>
    </n-card>
    <n-button
      type="error"
      class="mt-4"
      @click="signOut"
    >
      Sign Out
    </n-button>
  </div>
</template>
