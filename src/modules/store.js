// Pull in required modules
import { stringFormats } from '~/modules/utilities';
import Cookies from 'js-cookie';
import { createApp, reactive } from 'vue';
import { createStore, createNamespacedHelpers } from 'vuex';

// Tell Vue to use Vuex (the datastore)
const app = createApp();
app.use(createStore());

// Generations a Map State, which tells components where to get/set data in the
// store.
const getMapState = schema => {
  const schemaCamelTitle = stringFormats.camelCase(schema.title);
  const columns = [];
  
  schema.columns.forEach(column => {
    columns.push(column.columnName);
  });

  return columns.reduce((mapStateObj, column) => {
    mapStateObj[column] = state => state[schemaCamelTitle][column];
    return mapStateObj;
  }, {});
};

// Generates the computed values for a component
const getComputed = schema => {
  const config = {};

  schema.columns.forEach(column => {
    const columnName = column.columnName;
    config[columnName] = {
      get() {
        const schemaCamelTitle = stringFormats
          .camelCase(schema.title)
          .replace(/\s(.)/g, $1 => $1.toUpperCase())
          .replace(/\s/g, '')
          .replace(/^(.)/, $1 => $1.toLowerCase());
        return this.$store.state[schemaCamelTitle][columnName];
      },
      set(val) {
        const schemaCamelTitle = stringFormats
          .camelCase(schema.title)
          .replace(/\s(.)/g, $1 => $1.toUpperCase())
          .replace(/\s/g, '')
          .replace(/^(.)/, $1 => $1.toLowerCase());
        this.$store.state[schemaCamelTitle][columnName] = val;
      },
    };
  });

  return config;
};

// Create a store config
const getStoreConfig = (schema, isNew = false) => {
  const schemaCamelTitle = stringFormats.camelCase(schema.title);
  const state = reactive(schema);

  schema.columns.forEach(column => {
    const hasDefault = column.default !== null && column.default !== undefined;
    state[column.columnName] = hasDefault ? column.default : null;
  });

  const config = {
    modules: {
      schema: {
        namespaced: true,
        state,
      },
      duplication: {
        namespaced: true,
        state: {
          ready: false,
          reportID: null,
          columns: {},
          associations: {},
          subschemas: {},
        },
      },
      preferences: {
        namespaced: true,
        state: {
          showNotificationsForChanges: Cookies.get('showNotificationsForChanges')
            ? JSON.parse(Cookies.get('showNotificationsForChanges'))
            : true,
        },
        mutations: {
          hideNotifications(state) {
            state.showNotificationsForChanges = false;
            Cookies.set('showNotificationsForChanges', false);
          },
          showNotifications(state) {
            state.showNotificationsForChanges = true;
            Cookies.set('showNotificationsForChanges', true);
          },
        },
      },
      [schemaCamelTitle]: {
        namespaced: true,
        state: {
          _fetched: false,
        },
      },
    },
  };

  if (schema.associations) {
    schema.associations.forEach(association => {
      if ((isNew && (association.isAssignable || association.multiSelect)) || !isNew) {
        const associationCamelTitle = stringFormats.camelCase(association.title);
        if (!config.modules[associationCamelTitle]) {
          config.modules[associationCamelTitle] = {
            namespaced: true,
            mutations: {
              setRecords(state, payload) {
                state.records = payload.records;
              },
            },
            state: {
              fetched: false,
              records: [],
            },
          };
        }
      }
    });
  }

  if (schema.subschemas) {
    config.modules.subschemas = {
      modules: {},
      namespaced: true,
      state: {
        fetched: false,
      },
    };
    schema.subschemas.forEach(subschema => {
      const subSchemaCamelTitle = stringFormats.camelCase(subschema.title);
      if (!config.modules.subschemas.modules[subSchemaCamelTitle]) {
        config.modules.subschemas.modules[subSchemaCamelTitle] = getStoreConfig(subschema.schema);
      }
    });
  }

  return config;
};

// Creates the actual data store
const getStore = (schema, isNew = false) => {
  const storeConfig = getStoreConfig(schema, isNew);
  const store = createStore(storeConfig);

  return store;
};

// Export our functions
export {
  getComputed,
  getMapState,
  getStore,
  getStoreConfig,
};
