// Import the required dependencies
import { createApp } from 'vue';
import 'url-polyfill';
import 'element-matches';

// Import your main component
import ResearchFarmEntryForm from '~/ResearchFarmEntryForm';
import { logError } from '~/modules/caesdb';

// Create the Vue app instance
const app = createApp(ResearchFarmEntryForm);

// Add global filters
app.config.globalProperties.$filters = {
  capitalize(str) {
    if (!str) return '';
    str = str.toString();
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};

// Set error and warning handlers
app.config.errorHandler = logError;
app.config.warnHandler = logError;

// Mount the app to the DOM
app.mount('#app');
