<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { NButton, NCard, NFlex, NIcon, NSpace, NTag, NTooltip, NSwitch, NInputNumber, NPopover } from 'naive-ui';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  Clock,
  Settings,
} from '@vicons/tabler';
import { useTasks } from '../composables/useTasks';
import CalendarTaskModal from '../components/CalendarTaskModal.vue';
import type { TaskType } from '../types/TaskType';
import { supabase } from '../services/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();

const {
  tasks,
  loading,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getTasksForDate,
  getTasksWithoutDate,
} = useTasks();

// Calendar state
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const showTaskModal = ref(false);
const editingTask = ref<TaskType | null>(null);
const draggedTask = ref<TaskType | null>(null);

// View modes
const viewMode = ref<'month' | 'week' | 'day'>('month');

// Work mode settings
const workMode = ref(false);
const workHoursStart = ref(8);
const workHoursEnd = ref(22);

// Calendar navigation
const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const headerText = computed(() => {
  if (viewMode.value === 'month') {
    return `${monthNames[currentMonth.value]} ${currentYear.value}`;
  }
  if (viewMode.value === 'day') {
    return `${dayNames[currentDate.value.getDay()]}, ${monthNames[currentDate.value.getMonth()]} ${currentDate.value.getDate()}, ${currentDate.value.getFullYear()}`;
  }
  const weekStart = getWeekStart(currentDate.value);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }
  return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
});

// Calendar grid generation
const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};

const calendarDays = computed(() => {
  if (viewMode.value === 'day') {
    return [new Date(currentDate.value)];
  }
  if (viewMode.value === 'week') {
    return getWeekDays();
  }
  return getMonthDays();
});

const getMonthDays = () => {
  const days: Date[] = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);

  // Add days from previous month to fill the first week
  const startDay = firstDay.getDay();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - i - 1);
    days.push(d);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(currentYear.value, currentMonth.value, i));
  }

  // Add days from next month to complete the last week
  const remainingDays = 42 - days.length; // 6 rows × 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(lastDay);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return days;
};

const getWeekDays = () => {
  const days: Date[] = [];
  const weekStart = getWeekStart(currentDate.value);

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return days;
};

// Navigation
const navigatePrev = () => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  } else if (viewMode.value === 'day') {
    const d = new Date(currentDate.value);
    d.setDate(d.getDate() - 1);
    currentDate.value = d;
  } else {
    const d = new Date(currentDate.value);
    d.setDate(d.getDate() - 7);
    currentDate.value = d;
  }
};

const navigateNext = () => {
  if (viewMode.value === 'month') {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  } else if (viewMode.value === 'day') {
    const d = new Date(currentDate.value);
    d.setDate(d.getDate() + 1);
    currentDate.value = d;
  } else {
    const d = new Date(currentDate.value);
    d.setDate(d.getDate() + 7);
    currentDate.value = d;
  }
};

const goToToday = () => {
  currentDate.value = new Date();
};

// Task operations
const openAddTask = (date?: Date) => {
  selectedDate.value = date || null;
  editingTask.value = null;
  showTaskModal.value = true;
};

const openEditTask = (task: TaskType) => {
  editingTask.value = task;
  selectedDate.value = null;
  showTaskModal.value = true;
};

const handleSaveTask = async (data: {
  title: string;
  description: string;
  dueTo: Date | null;
}) => {
  if (editingTask.value) {
    await updateTask(editingTask.value.task_id, {
      title: data.title,
      description: data.description,
      dueTo: data.dueTo,
    });
  } else {
    await createTask({
      title: data.title,
      description: data.description,
      dueTo: data.dueTo,
    });
  }
  showTaskModal.value = false;
};

const handleDeleteTask = async (taskId: number) => {
  await deleteTask(taskId);
  showTaskModal.value = false;
};

// Drag and drop
const handleDragStart = (event: DragEvent, task: TaskType) => {
  draggedTask.value = task;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.task_id.toString());
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const handleDrop = async (event: DragEvent, targetDate: Date) => {
  event.preventDefault();
  if (draggedTask.value) {
    // Preserve the time if exists, otherwise set to noon
    const existingDate = draggedTask.value.dueTo
      ? new Date(draggedTask.value.dueTo)
      : null;

    const newDate = new Date(targetDate);
    if (existingDate) {
      newDate.setHours(existingDate.getHours());
      newDate.setMinutes(existingDate.getMinutes());
    } else {
      newDate.setHours(12, 0, 0, 0);
    }

    await moveTask(draggedTask.value.task_id, newDate);
    draggedTask.value = null;
  }
};

const handleDragEnd = () => {
  draggedTask.value = null;
};

// Helpers
const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isCurrentMonth = (date: Date) => {
  return date.getMonth() === currentMonth.value;
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getTaskPriorityColor = (task: TaskType) => {
  const importance = task.importance || 0;
  const urgency = task.urgency || 0;
  const priority = importance + urgency;

  if (priority >= 6) return 'error';
  if (priority >= 4) return 'warning';
  if (priority >= 2) return 'info';
  return 'default';
};

// Hour-based helpers for week/day view
const allHours = Array.from({ length: 24 }, (_, i) => i);

const displayedHours = computed(() => {
  if (workMode.value && (viewMode.value === 'week' || viewMode.value === 'day')) {
    return allHours.filter(h => h >= workHoursStart.value && h < workHoursEnd.value);
  }
  return allHours;
});

const formatHour = (hour: number) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour} ${period}`;
};

const getTasksForDateAndHour = (date: Date, hour: number) => {
  return tasks.value.filter((task) => {
    if (!task.dueTo) return false;
    const taskDate = new Date(task.dueTo);
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear() &&
      taskDate.getHours() === hour
    );
  });
};

const openAddTaskWithTime = (date: Date, hour: number) => {
  const newDate = new Date(date);
  newDate.setHours(hour, 0, 0, 0);
  selectedDate.value = newDate;
  editingTask.value = null;
  showTaskModal.value = true;
};

const handleDropWithHour = async (event: DragEvent, targetDate: Date, hour: number) => {
  event.preventDefault();
  if (draggedTask.value) {
    const newDate = new Date(targetDate);
    newDate.setHours(hour, 0, 0, 0);

    await moveTask(draggedTask.value.task_id, newDate);
    draggedTask.value = null;
  }
};

const isCurrentHour = (date: Date, hour: number) => {
  const now = new Date();
  return isToday(date) && now.getHours() === hour;
};

// Sign out
const signOut = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};

// Navigate to list view
const goToListView = () => {
  router.push('/task-manager');
};

onMounted(() => {
  fetchTasks();
});

const unscheduledTasks = computed(() => getTasksWithoutDate());
</script>

<template>
  <div class="calendar-container p-4 min-h-screen">
    <!-- Header -->
    <n-card class="mb-4">
      <n-flex justify="space-between" align="center">
        <n-flex align="center" :size="16">
          <h1 class="text-2xl font-bold">Calendar</h1>
          <n-button quaternary circle @click="goToListView">
            <template #icon>
              <n-icon><List /></n-icon>
            </template>
          </n-button>
        </n-flex>

        <n-flex align="center" :size="12">
          <!-- View mode toggle -->
          <n-space>
            <n-button
              :type="viewMode === 'month' ? 'primary' : 'default'"
              size="small"
              @click="viewMode = 'month'"
            >
              Month
            </n-button>
            <n-button
              :type="viewMode === 'week' ? 'primary' : 'default'"
              size="small"
              @click="viewMode = 'week'"
            >
              Week
            </n-button>
            <n-button
              :type="viewMode === 'day' ? 'primary' : 'default'"
              size="small"
              @click="viewMode = 'day'"
            >
              Day
            </n-button>
          </n-space>

          <!-- Work mode toggle (only for week/day views) -->
          <n-popover v-if="viewMode === 'week' || viewMode === 'day'" trigger="click">
            <template #trigger>
              <n-button :type="workMode ? 'primary' : 'default'" size="small">
                <template #icon>
                  <n-icon><Clock /></n-icon>
                </template>
                Work Mode
              </n-button>
            </template>
            <div class="p-2 space-y-3">
              <n-flex align="center" :size="8">
                <n-switch v-model:value="workMode" />
                <span>{{ workMode ? 'On' : 'Off' }}</span>
              </n-flex>
              <div v-if="workMode" class="space-y-2">
                <n-flex align="center" :size="8">
                  <span class="text-sm w-12">From:</span>
                  <n-input-number
                    v-model:value="workHoursStart"
                    :min="0"
                    :max="23"
                    size="small"
                    class="w-20"
                  />
                  <span class="text-gray-400 text-sm">{{ formatHour(workHoursStart) }}</span>
                </n-flex>
                <n-flex align="center" :size="8">
                  <span class="text-sm w-12">To:</span>
                  <n-input-number
                    v-model:value="workHoursEnd"
                    :min="1"
                    :max="24"
                    size="small"
                    class="w-20"
                  />
                  <span class="text-gray-400 text-sm">{{ formatHour(workHoursEnd) }}</span>
                </n-flex>
              </div>
            </div>
          </n-popover>

          <!-- Navigation -->
          <n-flex align="center" :size="8">
            <n-button quaternary circle @click="navigatePrev">
              <template #icon>
                <n-icon><ChevronLeft /></n-icon>
              </template>
            </n-button>
            <span class="text-lg font-medium min-w-48 text-center">
              {{ headerText }}
            </span>
            <n-button quaternary circle @click="navigateNext">
              <template #icon>
                <n-icon><ChevronRight /></n-icon>
              </template>
            </n-button>
            <n-button size="small" @click="goToToday">Today</n-button>
          </n-flex>

          <n-button type="primary" @click="openAddTask()">
            <template #icon>
              <n-icon><Plus /></n-icon>
            </template>
            Add Task
          </n-button>

          <n-button type="error" ghost @click="signOut">Sign Out</n-button>
        </n-flex>
      </n-flex>
    </n-card>

    <n-flex :size="16">
      <!-- Calendar Grid -->
      <n-card class="flex-1 overflow-hidden">
        <!-- Month View -->
        <template v-if="viewMode === 'month'">
          <!-- Day headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div
              v-for="day in dayNames"
              :key="day"
              class="text-center font-semibold text-gray-400 py-2"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar cells -->
          <div class="grid grid-cols-7 gap-1 grid-rows-6">
            <div
              v-for="(day, index) in calendarDays"
              :key="index"
              class="calendar-cell border border-gray-700 rounded p-2 transition-colors min-h-24"
              :class="{
                'bg-gray-800/50': !isCurrentMonth(day),
                'bg-blue-900/30 border-blue-500': isToday(day),
                'hover:bg-gray-700/50': true,
              }"
              @dragover="handleDragOver"
              @drop="handleDrop($event, day)"
              @dblclick="openAddTask(day)"
            >
              <!-- Date number -->
              <div class="flex justify-between items-start mb-1">
                <span
                  class="text-sm"
                  :class="{
                    'text-gray-500': !isCurrentMonth(day),
                    'font-bold text-blue-400': isToday(day),
                  }"
                >
                  {{ day.getDate() }}
                </span>
                <n-button
                  quaternary
                  circle
                  size="tiny"
                  @click.stop="openAddTask(day)"
                >
                  <template #icon>
                    <n-icon size="12"><Plus /></n-icon>
                  </template>
                </n-button>
              </div>

              <!-- Tasks for this day -->
              <div class="space-y-1 overflow-y-auto max-h-20">
                <div
                  v-for="task in getTasksForDate(day)"
                  :key="task.task_id"
                  class="task-item p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
                  :class="{
                    'bg-red-900/60': getTaskPriorityColor(task) === 'error',
                    'bg-yellow-900/60': getTaskPriorityColor(task) === 'warning',
                    'bg-blue-900/60': getTaskPriorityColor(task) === 'info',
                    'bg-gray-700': getTaskPriorityColor(task) === 'default',
                  }"
                  draggable="true"
                  @dragstart="handleDragStart($event, task)"
                  @dragend="handleDragEnd"
                  @click.stop="openEditTask(task)"
                >
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <div class="truncate">
                        <span v-if="task.dueTo" class="text-gray-400 mr-1">
                          {{ formatTime(task.dueTo) }}
                        </span>
                        {{ task.title }}
                      </div>
                    </template>
                    <div>
                      <strong>{{ task.title }}</strong>
                      <p v-if="task.description" class="text-sm mt-1">
                        {{ task.description }}
                      </p>
                    </div>
                  </n-tooltip>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Week/Day View with Hours -->
        <template v-else>
          <div class="week-view-container overflow-auto" style="max-height: 70vh;">
            <!-- Header row with days -->
            <div class="week-header sticky top-0 z-10 bg-gray-900">
              <div 
                class="grid gap-0 border-b border-gray-700"
                :class="viewMode === 'day' ? 'grid-cols-2' : 'grid-cols-8'"
              >
                <!-- Empty corner for time column -->
                <div class="w-16 min-w-16 p-2 border-r border-gray-700"></div>
                <!-- Day headers -->
                <div
                  v-for="day in calendarDays"
                  :key="day.toISOString()"
                  class="text-center p-2 border-r border-gray-700"
                  :class="{ 'bg-blue-900/30': isToday(day) }"
                >
                  <div class="text-gray-400 text-sm">{{ dayNames[day.getDay()] }}</div>
                  <div
                    class="text-lg font-semibold"
                    :class="{ 'text-blue-400': isToday(day) }"
                  >
                    {{ day.getDate() }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Time grid -->
            <div class="week-grid">
              <div
                v-for="hour in displayedHours"
                :key="hour"
                class="grid gap-0"
                :class="viewMode === 'day' ? 'grid-cols-2' : 'grid-cols-8'"
              >
                <!-- Time label -->
                <div class="w-16 min-w-16 p-1 text-xs text-gray-500 text-right pr-2 border-r border-gray-700 h-12">
                  {{ formatHour(hour) }}
                </div>
                <!-- Hour cells for each day -->
                <div
                  v-for="day in calendarDays"
                  :key="`${day.toISOString()}-${hour}`"
                  class="hour-cell border-r border-b border-gray-700/50 h-12 p-0.5 transition-colors hover:bg-gray-700/30 relative"
                  :class="{
                    'bg-blue-900/20': isToday(day),
                    'bg-green-900/30 border-green-500': isCurrentHour(day, hour),
                  }"
                  @dragover="handleDragOver"
                  @drop="handleDropWithHour($event, day, hour)"
                  @dblclick="openAddTaskWithTime(day, hour)"
                >
                  <!-- Tasks for this hour -->
                  <div class="overflow-hidden h-full">
                    <div
                      v-for="task in getTasksForDateAndHour(day, hour)"
                      :key="task.task_id"
                      class="task-item px-1 py-0.5 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity truncate"
                      :class="{
                        'bg-red-900/80': getTaskPriorityColor(task) === 'error',
                        'bg-yellow-900/80': getTaskPriorityColor(task) === 'warning',
                        'bg-blue-900/80': getTaskPriorityColor(task) === 'info',
                        'bg-gray-600': getTaskPriorityColor(task) === 'default',
                      }"
                      draggable="true"
                      @dragstart="handleDragStart($event, task)"
                      @dragend="handleDragEnd"
                      @click.stop="openEditTask(task)"
                    >
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <div class="truncate">
                            <span class="text-gray-300 mr-1">
                              {{ formatTime(task.dueTo!) }}
                            </span>
                            {{ task.title }}
                          </div>
                        </template>
                        <div>
                          <strong>{{ task.title }}</strong>
                          <p v-if="task.description" class="text-sm mt-1">
                            {{ task.description }}
                          </p>
                        </div>
                      </n-tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </n-card>

      <!-- Unscheduled Tasks Sidebar -->
      <n-card class="w-64" title="Unscheduled">
        <template #header-extra>
          <n-button quaternary size="small" @click="openAddTask()">
            <template #icon>
              <n-icon><Plus /></n-icon>
            </template>
          </n-button>
        </template>

        <div class="space-y-2">
          <div
            v-if="unscheduledTasks.length === 0"
            class="text-gray-500 text-sm text-center py-4"
          >
            No unscheduled tasks
          </div>
          <div
            v-for="task in unscheduledTasks"
            :key="task.task_id"
            class="task-item p-2 rounded cursor-pointer hover:opacity-80 transition-opacity bg-gray-700"
            draggable="true"
            @dragstart="handleDragStart($event, task)"
            @dragend="handleDragEnd"
            @click="openEditTask(task)"
          >
            <div class="font-medium truncate">{{ task.title }}</div>
            <div v-if="task.description" class="text-xs text-gray-400 truncate">
              {{ task.description }}
            </div>
          </div>
        </div>
      </n-card>
    </n-flex>

    <!-- Task Modal -->
    <CalendarTaskModal
      v-model:show="showTaskModal"
      :task="editingTask"
      :default-date="selectedDate"
      @save="handleSaveTask"
      @delete="handleDeleteTask"
    />
  </div>
</template>

<style scoped>
.calendar-cell {
  min-height: 100px;
}

.task-item {
  user-select: none;
}

.task-item[draggable='true']:active {
  opacity: 0.5;
}

.week-view-container {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #1a202c;
}

.week-view-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.week-view-container::-webkit-scrollbar-track {
  background: #1a202c;
}

.week-view-container::-webkit-scrollbar-thumb {
  background-color: #4a5568;
  border-radius: 4px;
}

.hour-cell {
  min-width: 100px;
}

.week-header {
  background-color: rgb(17 24 39);
}
</style>
