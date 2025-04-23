import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dev.tapgo.cc/test',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api