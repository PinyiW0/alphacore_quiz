<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import api from '../api';

const router = useRouter();
const $q = useQuasar();

const listQuery = reactive({
  city: [],
  delivery_date: '',
  financial_status: '',
  fulfillment_status: '',
  is_descending: true,
  order_status: '',
  page: 1,
  size: 20,
  sort_by: 'created_at',
});

const rows = ref([]);
const loading = ref(false);

const columns = [
  // { name: 'index', label: '排序', field: 'index' },
  { name: 'order_name', label: 'Order', field: 'order_name', sortable: true },
  { name: 'customer_name', label: 'Customer', field: 'customer_name' },
  {
    name: 'total_price', label: 'Price', field: 'total_price', sortable: true,
    format: (val) => `$${val.toLocaleString()}`
  },
  { name: 'receiver_address', label: 'Address', field: 'receiver_address' },
  { name: 'delivery_date', label: 'Delivery Date', field: 'delivery_date', sortable: true },
  {
    name: 'created_at', label: 'Time', field: 'created_at', sortable: true,
    format: (val) => new Date(val).toLocaleString()
  },
  { name: 'order_status', label: 'Status', field: 'order_status' },
  { name: 'financial_status', label: 'Payment', field: 'financial_status' },
  { name: 'fulfillment_status', label: 'Fulfillment', field: 'fulfillment_status' }
];
const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
});

/** 篩選選項 */
const cityOptions = ['台北市', '新北市', '新竹市', '台南市', '高雄市'];
const orderStatusOptions = [
  { label: 'open', value: 'open' },
  { label: 'cancelled', value: 'cancelled' },
  { label: 'closed', value: 'closed' }
];
const paymentOptions = [
  { label: 'paid', value: 'paid' },
  { label: 'pending', value: 'pending' },
  { label: 'refunded', value: 'refunded' }
];
const fulfillmentOptions = [
  { label: 'received', value: 'received' },
  { label: 'preparing', value: 'preparing' }
];

/** 處理篩選帶入值 */
const handleParams = () => {
  const { page, size, sort_by, is_descending, city, delivery_date, order_status, financial_status, fulfillment_status } = listQuery;
  const params = {
    page: page - 1,
    size,
    sort_by,
    is_descending
  };
  if (city && city.length > 0) params['city[]'] = city;
  if (delivery_date) params.delivery_date = delivery_date;
  if (order_status) params.order_status = order_status;
  if (financial_status) params.financial_status = financial_status;
  if (fulfillment_status) params.fulfillment_status = fulfillment_status;
  return params
};

/** 取得訂單資料 */
const getList = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    $q.notify({
      type: 'negative',
      message: '請先登入會員',
      position: 'top'
    });
    return router.push('/');
  };
  loading.value = true;
  try {
    const res = await api.get('/orders', { headers: { Authorization: token }, params: handleParams() });
    rows.value = res.data.content;
    pagination.value.rowsNumber = res.data.total_elements;
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: `無法取得訂單資料,${err}`,
      position: 'top'
    })
  } finally {
    loading.value = false;
  }
};
/** 登出 */
const logout = () => {
  loading.value = true;
  localStorage.removeItem('token');
  $q.notify({ type: 'positive', message: '已登出', position: 'top' })
  router.push('/')
    .finally(() => {
      loading.value = false
    });
};

onMounted(() => {
  getList();
});
</script>

<template>
  <q-page class="q-pa-none">
    <q-card flat bordered class="full-width full-height">
      <q-card-section class="row items-center justify-between">
        <h1 class="text-h5 text-bold">訂單列表</h1>
        <q-btn @click="logout" :loading="loading" label="登出" type="submit" color="primary" />
      </q-card-section>

      <q-table flat bordered title="Treats" :rows="rows" :columns="columns" row-key="index"
        v-model:pagination="pagination" :rows-per-page-options="[20]" :loading="loading" class="full-height">

        <!-- 篩選功能 -->
        <template v-slot:top="props">
          <div class="row wrap items-center q-gutter-sm">
            <!-- 縣市選擇 -->
            <q-select @update:model-value="val => { listQuery.page = 1; listQuery.city = val; getList(); }"
              :model-value="listQuery.city" multiple :options="cityOptions" :clear-value="[]" label="City" dense
              outlined clearable style="min-width: 160px;" />
            <!-- 日期選擇 -->
            <q-input @update:model-value="val => { listQuery.page = 1; listQuery.delivery_date = val; getList(); }"
              v-model="listQuery.delivery_date" :max="new Date().toISOString().slice(0, 10)" type="date"
              label="Delivery Date" dense outlined clearable style="min-width: 160px;" />
            <!-- 訂單狀態 -->
            <q-select @update:model-value="val => { listQuery.page = 1; listQuery.order_status = val; getList(); }"
              v-model="listQuery.order_status" :options="orderStatusOptions" :clear-value="''" emit-value map-options
              label="Status" dense outlined clearable style="min-width: 160px;" />
            <!-- 付款狀態 -->
            <q-select @update:model-value="val => { listQuery.page = 1; listQuery.financial_status = val; getList(); }"
              v-model="listQuery.financial_status" :options="paymentOptions" :clear-value="''" emit-value map-options
              label="Payment Status" dense outlined clearable style="min-width: 160px;" />
            <!-- 配送狀態 -->
            <q-select
              @update:model-value="val => { listQuery.page = 1; listQuery.fulfillment_status = val; getList(); }"
              v-model="listQuery.fulfillment_status" :options="fulfillmentOptions" :clear-value="''" emit-value
              map-options label="Fulfillment" dense outlined clearable style="min-width: 160px;" />
          </div>

          <q-space />
          <!-- 上面的 pagination -->
          <q-pagination @update:model-value="val => { listQuery.page = val; getList() }" v-model="props.pagination.page"
            :max="Math.ceil(props.pagination.rowsNumber / props.pagination.rowsPerPage)" max-pages="6" boundary-numbers
            size="sm" />
        </template>


        <!-- 下面的 pagination -->
        <template v-slot:bottom="props">
          <q-pagination @update:model-value="val => { listQuery.page = val; getList() }" v-model="props.pagination.page"
            :max="Math.ceil(props.pagination.rowsNumber / props.pagination.rowsPerPage)" max-pages="6" boundary-numbers
            size="sm" />
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>