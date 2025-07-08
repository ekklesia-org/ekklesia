import './main.css';
import '@ekklesia/ui';
import router from './router';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './app/App.vue';
import { i18n } from './i18n';
import { useAuthStore } from './stores/auth';
import axios from 'axios';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Create app and pinia
const app = createApp(App);
const pinia = createPinia();

// Install plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Initialize auth store after pinia is installed
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#root');
