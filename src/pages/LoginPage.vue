<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

const temp = reactive({
  username: '',
  password: ''
});
const loading = ref(false);

/** 重置帳號密碼 */
const onReset = () => {
  temp.username = '';
  temp.password = '';
};

/** 登入 */
const onSubmit = async () => {
  loading.value = true;
  try {
    const res = await api.post('/auth/login', temp);
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      $q.notify({
        type: 'positive',
        message: '登入成功！',
        position: 'top'
      });
    }
    router.push('/order');
  } catch (err) {
    onReset();
    $q.notify({
      type: 'negative',
      message: `登入失敗 ${err}`,
      position: 'top'
    });
  } finally {
    loading.value = false
  }
};
</script>

<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg shadow-5" style="width: 400px; max-width: 90vw; border-radius: 16px;">
      <h1 class="text-h4 text-center text-bold">登入頁</h1>
      <div class="q-pa-md" style="max-width: 600px">
        <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
          <q-input filled v-model="temp.username" label="帳號 *" lazy-rules :rules="[val => !!val || '請輸入您的帳號']" />

          <q-input filled v-model="temp.password" label="密碼 *" lazy-rules :rules="[
            val => !!val || '請輸入您的密碼',
          ]" />

          <div class="row justify-end">
            <q-btn label="重置" type="reset" color="primary" flat class="q-ml-sm" />
            <q-btn label="登入" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>

      </div>
    </q-card>
  </q-page>
</template>