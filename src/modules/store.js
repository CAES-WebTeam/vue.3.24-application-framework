// Pull in required modules
import { stringFormats } from "~/modules/utilities";
import Cookies from "js-cookie";
import { createStore } from "vuex";

// Generations a Map State, which tells components where to get/set data in the
// store.
const getMapState = (schema) => {
	const schemaCamelTitle = stringFormats.camelCase(schema.title);
	const columns = [];

	schema.columns.forEach((column) => {
		columns.push(column.columnName);
	});

	return columns.reduce((mapStateObj, column) => {
		mapStateObj[column] = (state) => state[schemaCamelTitle][column];
		return mapStateObj;
	}, {});
};

// Generates the computed values for a component
const getComputed = (schema) => {
	const config = {};

	schema.columns.forEach((column) => {
		const columnName = column.columnName;
		config[columnName] = {
			get() {
				const schemaCamelTitle = stringFormats
					.camelCase(schema.title)
					.replace(/\s(.)/g, ($1) => $1.toUpperCase())
					.replace(/\s/g, "")
					.replace(/^(.)/, ($1) => $1.toLowerCase());
				return this.$store.state[schemaCamelTitle][columnName];
			},
			set(val) {
				const schemaCamelTitle = stringFormats
					.camelCase(schema.title)
					.replace(/\s(.)/g, ($1) => $1.toUpperCase())
					.replace(/\s/g, "")
					.replace(/^(.)/, ($1) => $1.toLowerCase());
				this.$store.state[schemaCamelTitle][columnName] = val;
			},
		};
	});

	return config;
};

// Create a store config
const getStoreConfig = (schema, isNew = false) => {
	// rest of your code here...
};

// Creates the actual data store
const getStore = (schema, isNew = false) => {
	const storeConfig = getStoreConfig(schema, isNew);
	const store = createStore(storeConfig);

	return store;
};

// Export our functions
export { getComputed, getMapState, getStore, getStoreConfig };
