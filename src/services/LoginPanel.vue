<script setup>
import { ref } from 'vue';
import { NCard, NForm, NFormItem, NInput } from 'naive-ui';

const signIn = ref(true); // This can be a prop or a reactive variable
const formRef = ref(null);

const form = ref({
  email: '',
});

const rules = {
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Please enter a valid email address' },
  ],
};
</script>

<template>
  <div class="container">
    <n-card :title=" signIn ? 'Sign in' : 'Sign Up' "> 
        <n-form ref="formRef" :model="form" :rules="rules">
            <n-form-item label="Email" path="email">
                <n-input v-model:value="form.email" type="email" placeholder="Enter your email" />
            </n-form-item>
        </n-form>
    </n-card>
  </div>
</template>

<style scoped>

</style>