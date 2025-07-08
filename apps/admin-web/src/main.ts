import './main.css';
import router from './router';
import { createApp } from 'vue';
import App from './app/App.vue';
import { i18n } from './i18n';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add auth token to requests if available
const token = localStorage.getItem('auth_token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount('#root');
