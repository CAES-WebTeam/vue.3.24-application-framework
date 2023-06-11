// Converted
import 'url-polyfill';
import 'element-matches';
import { createApp } from 'vue';
import GACountsReport from '~/GACountsReport';
import { logError } from '~/modules/caesdb';
import dateFormat from 'dateformat';

const app = createApp(GACountsReport);

app.config.errorHandler = logError;
app.config.warnHandler = logError;

app.filter('capitalize', str => {
  if (!str) return '';
  str = str.toString();
  return str.charAt(0).toUpperCase() + str.slice(1);
});

app.filter('simple-date', dt => dateFormat(dt, 'm/d/yy'));

app.mount('#app');
