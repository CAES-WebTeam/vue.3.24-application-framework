<template lang="html">
	<form>
		<!-- Loop through each of the columns specified in the schema -->
		<div v-for="column in schema.columns" :key="column.columnName">
			<transition appear name="fade">
				<!--
					If the column should be displayed, create a fieldset to hold the fields
				-->
				<fieldset v-if="columnShouldBeDisplayed(column)">
					<label>
						<legend>
							<strong>
								<!--
									Show the column's pretty name if set, otherwise create a
									pretty-ish name from the column name
								-->
								{{ column.prettyName || getPrettyColumnName(column.columnName) }}
							</strong>
						</legend>
						<!--
							Pretty straightforward here: use the approriate input type depending
							on what type of data we're working with
						-->
						<textarea
							v-if="sqlToHtml(column) === 'textarea'"
							v-model="record[column.columnName]"
							:required="false && column.required"
							:disabled="column.immutable"
						>
						</textarea>
						<Editor
							v-else-if="column.inputType === 'richtext' || sqlToHtml(column) === 'richtext'"
							v-model="record[column.columnName]"
						/>
						<select
							v-else-if="sqlToHtml(column) === 'select'"
							v-model="record[column.columnName]"
							:required="false && column.required"
							:disabled="column.immutable"
						>
							<option v-for="value in column.constraint.values" :key="value[column.constraint.foreignKey]" :value="value[column.constraint.foreignKey]">
								{{ value[column.constraint.foreignLabel] }}
							</option>
						</select>
						<input
							v-else
							v-model="record[column.columnName]"
							:type="sqlToHtml(column)"
							:required="false && column.required"
							:disabled="column.immutable"
						/>
					</label>
				</fieldset>
			</transition>
		</div>
		<!-- If no data store, add a button to update this record individually -->
		<input
			v-if="!$store"
			class="button"
			value="Save"
			type="submit"
		/>
	</form>
</template>

<script>
	/* global activeUserID */
	// Import required modules
	import Editor from '@tinymce/tinymce-vue';
	import {
		formatDates,
		getPrettyColumnName,
		sqlToHtml,
		stringFormats
	} from '~/modules/utilities';
	import {
		getCriteriaStructure,
		logError
	} from '~/modules/caesdb';

	// Export the actual component
	export default {
		name: 'DatabaseForm',
		components: { Editor },
		props: {
			schema: {
				type: Object,
				required: true
			},
			identifier: {
				type: [Object, Boolean],
				default: () => false
			}
		},
		data () {
			if (this.$store)

				// If using a store, return an empty object
				return {};


			// If not using a store, create a local record and return that as the
			// only data member for the component.
			const localRecord = {};
			this.schema.columns.forEach(column => {
				localRecord[column.columnName] = null;
			});

			return {
				localRecord
			};
		},
		computed: {
			record: {
				get () {
					// If there's a store, return the store's record, else just return the
					// local record.
					return this.$store ? this.$store.state[stringFormats.camelCase(this.schema.title)] : this.localRecord;
				},
				set (val) {
					// Similarly, if there's a store, set the store's record to the value,
					// and if not set the local record.
					if (this.$store) this.$store.state[stringFormats.camelCase(this.schema.title)] = val;
					else this.localRecord = val;
				}
			}
		},

		// The mounted function is run every time the component is loaded
		// ("mounted") on the page.
		mounted () {
			// Alias 'this' to component
			const component = this;

			// Create an empty array to hold encountered date fields.  Will be used
			// later to format SQL date values to the HTML standard
			const dateFields = [];

			// Then loop through each of the columns and push any date fields we find
			// into the array.
			component.schema.columns.forEach(column => {
				if (sqlToHtml(column) === 'date') dateFields.push(column.columnName);
			});

			// Our main data grabbing function, grabs data for the main schema
			const getMainData = () => {
				getCriteriaStructure(this.schema.databaseName, this.schema.tablePrefix, (err, data) => {
					if (err) logError(err);
					if (data) {
						const critStruct = data;
						critStruct[this.schema.criteria.string] = this.identifier.value;
						this.schema.fetchExisting(critStruct, (err, data) => {
							if (err) logError(err);
							if (data) {
								const existingRecord = data[0];
								for (const key in this.record) if (existingRecord.hasOwnProperty(key)) this.record[key] = existingRecord[key];
								else console.warn(`Local record has key "${key}" but remote record does not.`);


								if (dateFields.length > 0) formatDates(dateFields, this.record);
							}
						});
					}
				});
			};

			// Our constraint data grabbing function
			const getConstraintData = () => {
				// Loop through each of the schema's columns
				component.schema.columns.forEach(column => {
					// We only care about columns that have a constraint and a getValues
					// function, since those are the ones we have to fetch values for
					if (column.constraint && column.constraint.getValues) if (column.constraint.tablePrefix) {
						// If the constraint has a tablePrefix, we need to get a criteria
						// structure first, then send our request
						getCriteriaStructure(column.constraint.databaseName, column.constraint.tablePrefix, (err, criteriaStructure) => {
							if (err) logError(err);
							criteriaStructure[column.constraint.criteria.string] = column.constraint.criteria.useUserID ? activeUserID : column.constraint.criteria.value;
							column.constraint.getValues(criteriaStructure, (err, data) => {
								if (err) logError(err);
								if (data) column.constraint.values = data;
							});
						});
					} else {
						// If no table prefix, just fetch the data
						column.constraint.getValues((err, data) => {
							if (err) logError(err);
							if (data) column.constraint.values = data;
						});
					}
				});
			};

			// If an identifier was specified, we need to fetch that record's data
			if (component.identifier) getMainData();

			// Regardless, get all column constraint data
			getConstraintData();
		},
		methods: {
			getPrettyColumnName,
			sqlToHtml,

			// A function to determine if a column should be displayed or not
			columnShouldBeDisplayed (column) {
				// Check if the column has a dependency
				if (!column.depends) {
					if (column.automated) return false;


					// If ((!this.identifier || !this.identifier.key || (this.identifier.key && !this.identifier.value)) && column.automated) {
					// 	// If no identifier was passed in, or no identifier key was passed
					// 	// in, or if a key was passed in without a value, AND the column is
					// 	// set as automated, don't show the column.
					// 	return false;
					// }
					// Otherwise, do.
					return true;
				}


				// If the column has a dependency, run the depend's test on the
				// specified value to determine if the column should be shown or not.
				return column.depends.test(this.record[column.depends.column]);
			}
		}
	};
</script>

<style lang="scss" scoped>
	fieldset {
		border: none;
	}
	input[type="text"] {
		width: 100%;
	}
	input[type="date"] {
		font-family: inherit;
		font-size: inherit;
	}
	@media (min-width: 960px) {
		input[type="text"] {
			width: 50%;
		}
	}
	@media (min-width: 1400px) {
		input[type="text"] {
			width: 33%;
		}
	}
</style>
