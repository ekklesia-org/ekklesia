import './styles.scss';
import './main.css';
// Import UI library components and styles
import '@ekklesia/ui';
import router from './router';
import { createApp } from 'vue';
import App from './app/App.vue';

const app = createApp(App);
app.use(router);
app.mount('#root');
