<script setup>
import { ref, inject } from 'vue';
import { NCard, NForm, NFormItem, NInput, NButton, NFlex } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();

const signIn = ref(true);

const form = ref({
  email: '',
  password: '',
});

const rules = {
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email address' },
  ],
  password: [
    { required: true, message: 'Password is required' },
    { min: 6, message: 'Password must be at least 6 characters long' },
  ],
};

const supabase = inject('supabase');

const signInUser = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: form.value.email,
    password: form.value.password,
  });

  if (error) {
    console.error('Sign In Error:', error.message);
  } else {
    console.log('User signed in successfully');
    router.push('/task-manager'); // Redirect to Task Manager after sign-in
  }
};

const signUpUser = async () => {
  const { data: data, error } = await supabase.auth.signUp({
    email: form.value.email,
    password: form.value.password,
  });

  if (error) {
    console.error('Sign Up Error:', error.message);
  }

  if (data) {
    const { error } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
      })
      .single();
    if (error) {
      console.error('Error inserting user into database:', error.message);
    } else {
      console.log('User signed up successfully:', data);
    }
  }
};
</script>

<template>
  <n-flex class="justify-items-center" style="margin-bottom: 1rem">
    <n-button @click="signIn = true" type="primary" class="m-5">
      {{ 'Sign In' }}
    </n-button>
    <n-button type="primary" @click="signIn = false" class="m-5">
      {{ 'Sign Up' }}
    </n-button>
  </n-flex>
  <div class="container">
    <n-card :title="signIn ? 'Sign in' : 'Sign Up'">
      <n-form ref="form" :model="form" :rules="rules">
        <n-form-item label="Email" path="email">
          <n-input
            v-model:value="form.email"
            type="email"
            placeholder="Enter your email"
          />
        </n-form-item>
        <n-form-item label="Password" path="password">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="Enter your password"
          />
        </n-form-item>
        <n-form-item>
          <n-button @click="signIn ? signInUser() : signUpUser()">
            {{ signIn ? 'Sign In' : 'Sign Up' }}
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<style scoped></style>

export default { name: 'LoginPanel', };
