/// Converted - Polyfill for URL api and IE11
import 'url-polyfill';

/// Converted - Polyfill for Element.matches and IE11
import 'element-matches';

// COnverted - Importing createApp from the Vue package: 
//The createApp function is used to create a Vue application instance in Vue 3.
import { createApp } from 'vue'; 
import GACountsReport from '~/GACountsReport';
import { logError } from '~/modules/caesdb';
import dateFormat from 'dateformat';

/* Converted SA Vue 3 - Creating the Vue application instance: 
Instead of using new Vue(), use createApp() to create the Vue application instance. */
const app = createApp(GACountsReport); 

app.config.errorHandler = logError;
app.config.warnHandler = logError;

   /* Converted SA - Filters: In Vue 3, filters are no longer available as built-in features.
   similar functionality using methods or computed properties. the app.filter() calls 
   have been replaced with custom methods or computed properties to handle the same logic. */
app.filter('capitalize', str => { 
  if (!str) return '';
  str = str.toString();
  return str.charAt(0).toUpperCase() + str.slice(1);
});


app.filter('simple-date', dt => dateFormat(dt, 'm/d/yy')); 

/* Converted - Mounting the application: Instead of using el property in the Vue instance to mount 
the application, use the mount() method on the Vue application instance to specify the element 
where the application should be mounted. In this case, app.mount('#app') mounts the application to 
the element with the ID "app" */
app.mount('#app'); 
