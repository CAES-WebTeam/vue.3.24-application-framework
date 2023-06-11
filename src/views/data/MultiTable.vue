<template lang="html">
	<div v-if="schema.columns && records.length > 0">
		<h3 v-if="title || schema.title">
			{{ title || schema.title }}
			<a v-if="helpMessageName && mode === 'edit'" class="help-link" @click="$emit('show-help')">
				<HelpCircleIcon />
			</a>
		</h3>
		<p v-if="description && mode === 'edit'">
			{{ description }}
		</p>
		<table>
			<!-- <caption v-if="title || schema.title">
				{{ title || schema.title }}
				<a v-if="helpMessageName && mode === 'edit'" v-on:click="$emit('show-help')" class="help-link">
					<HelpCircleIcon />
				</a>
			</caption> -->
			<thead>
				<tr>
					<th v-for="column in filteredColumns" :key="column.columnName">
						{{ column.prettyName || getPrettyColumnName(column.columnName) }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="record in records" :key="record[optionColumnName]" :class="mode === 'view' && !recordHasValue(record) ? 'hide-on-print' : ''">
					<td v-for="column in filteredColumns" :key="column.columnName">
						<span v-if="column.columnName === optionColumnName">
							{{ getOptionLabel(record[optionColumnName]) }}
						</span>
						<label v-else-if="mode === 'edit' && columnShouldBeEditable(column)">
							<select v-if="sqlToHtml(column) === 'select'" v-model="record[column.columnName]" :disabled="column.immutable">
								<option v-for="value in column.constraint.values" :key="value.key" :value="value.key">
									{{ value.label }}
								</option>
							</select>
							<input
								v-else-if="sqlToHtml(column) === 'number'"
								v-model.number="record[column.columnName]"
								type="number" :min="column.min || 0"
								:disabled="column.immutable"
							/>
							<input
								v-else
								v-model="record[column.columnName]"
								:type="sqlToHtml(column)"
								:disabled="column.immutable"
							/>
						</label>
						<span v-else>
							{{ record[column.columnName] }}
						</span>
					</td>
				</tr>
				<tr v-for="record in viewableOldRecords" :key="record[optionColumnName]">
					<td v-for="column in filteredColumns" :key="column.columnName">
						<span v-if="column.columnName === optionColumnName">
							{{ getUnfilteredOptionLabel(record[optionColumnName]) }}
						</span>
						<span v-else>
							{{ record[column.columnName] }}
						</span>
					</td>
				</tr>
			</tbody>
			<tfoot v-if="showTotals">
				<tr>
					<td v-for="(column, index) in filteredColumns" :key="index">
						<span v-if="index === 0">
							Total
						</span>
						<span v-else-if="sqlToHtml(column) === 'number'">
							{{ getSum(column) }}
						</span>
						<span v-else>
							&nbsp;
						</span>
					</td>
				</tr>
			</tfoot>
		</table>
	</div>
</template>

<script>
	import HelpCircleIcon from 'vue-feather-icons/icons/HelpCircleIcon';
	import {
		getCriteriaStructure,
		logError
	} from '~/modules/caesdb';
	import { filter } from '~/modules/criteriaUtils';
	import {

		// FormatDates,
		getPrettyColumnName,
		modeValidator,
		sqlToHtml,
		stringFormats
	} from '~/modules/utilities';

	export default {
		name: 'DataMultiTable',
		components: { HelpCircleIcon },
		props: {
			associatedColumn: {
				type: String,
				default: null
			},
			depends: {
				type: Object,
				default: null
			},
			description: {
				type: String,
				default: null
			},
			filter: {
				type: Object,
				default: null
			},
			helpMessageName: {
				type: String,
				default: null
			},
			identifier: {
				type: Object,
				default: null
			},
			mode: {
				type: String,
				default: 'view',
				validator: modeValidator
			},
			optionColumnName: {
				type: String,
				required: true
			},
			schema: {
				type: Object,
				required: true
			},
			showTotals: {
				type: Boolean
			},
			title: {
				type: String,
				default: null
			}
		},
		data () {
			return {
				criteriaStructure: {},
				filterRecords: [],
				localRecords: [],
				oldRecords: []
			};
		},
		computed: {
			duplication () {
				return this.$store.state.duplication;
			},
			fetched: {
				get () { return this.$store.state[stringFormats.camelCase(this.title || this.schema.title)].fetched; },
				set (val) { this.$store.state[stringFormats.camelCase(this.title || this.schema.title)].fetched = val; }
			},
			filteredColumns () {
				return this.schema.columns.filter(column => this.columnShouldBeDisplayed(column));
			},
			filteredOptions () {
				// If no filter was specified, return the unfiltered options
				if (!this.filter) return this.options;

				// We need to make sure that all specified associations are satisfied
				// before we show any options, so we create this int to count as we
				// process associations
				let associationsSelected = 0;

				// Loop through each of the filter's associations, so that we can
				// populate the filter's criteria structure
				this.filter.associations.forEach(association => {
					// Create an array to hold that association's values
					const associatedValues = this.$store.state[stringFormats.camelCase(association.title)].records
						.map(record => record[association.column])
						.filter((column, i, arr) => arr.indexOf(column) === i);

					// If values have been set on the association, then we can assume
					// we've successfully processed that association.  So, increment our
					// counter.
					if (associatedValues.length > 0) associationsSelected++;

					// And push those values the criteria structure specified in the
					// filter.
					this.filter.criteriaStructure[`criteria_${association.criteriaColumn || association.column}_eq`] = associatedValues;
				});

				// Once our criteria structure is populated with values, run
				// the filter function to get the filtered records.
				const filteredRecords = filter(this.filterRecords, this.filter.criteriaStructure);

				// Then grab the values from those filtered records.
				const filteredValues = filteredRecords.map(r => r[this.filter.optionColumn]);

				// Create an empty array to hold them
				const filteredOptions = [];

				// Loop through each of the options
				this.options.forEach(option => {
					// And if the option's value is in the filteredValues array, push
					// the option into our filtered options array
					if (filteredValues.indexOf(option.key) !== -1) filteredOptions.push(option);
				});


				// If our counter says we've got all the data for all associations,
				// return our filtered options.  If all associations have not been
				// satisfied, return an empty array.
				return associationsSelected === this.filter.associations.length ? filteredOptions : [];
			},
			optionColumn () {
				return this.schema.columns
					.reduce((optionColumn, column, i, arr) => {
						if (column.columnName === this.optionColumnName) optionColumn = column;
						if (i === arr.length - 1 && optionColumn === null) logError(new Error('Could not find option column'));

						return optionColumn;
					}, null);
			},
			options: {
				get () {
					return this.optionColumn.constraint.values;
				}
			},
			records: {
				get () {
					return this.$store ? this.$store.state[stringFormats.camelCase(this.title || this.schema.title)].records : this.localRecords;
				},
				set (val) {
					if (this.$store) this.$store.commit(`${stringFormats.camelCase(this.title || this.schema.title)}/setRecords`, {
						records: val
					});
					else this.localRecords = val;
				}
			},
			viewableOldRecords () {
				if (this.mode === 'edit') return [];

				return this.oldRecords;
			}
		},
		watch: {
			duplication: {
				handler () {
					if (this.identifier.duplicate && this.duplication.associations[stringFormats.camelCase(this.title || this.schema.title)]) this.getExistingRecords();
				},
				deep: true
			},
			filteredOptions (oldOptions, newOptions) {
				const populateRecords = () => {
					this.filteredOptions.forEach(option => {
						this.records.push(this.generateRecord(option));
					});
				};

				const updateRecords = () => {
					let shouldUpdate = true;
					if (this.filter && this.filterRecords.length < 1) shouldUpdate = false;

					if (shouldUpdate) {
						const records = [];

						// Const optionsMap = this.filteredOptions.map(o => o.key);
						const recordsMap = this.records.map(r => r[this.optionColumnName]);
						this.filteredOptions.forEach(option => {
							const record = this.generateRecord(option);
							const existingRecord = this.records[recordsMap.indexOf(option.key)];
							for (const key in existingRecord) if (key !== this.optionColumnName && existingRecord[key] !== null) record[key] = existingRecord[key];

							records.push(record);
						});
						this.records = records;
					}
				};

				this.records.length > 0 ? updateRecords() : populateRecords();
			}
		},
		mounted () {
			const component = this;

			const dateFields = [];
			component.schema.columns.forEach(column => {
				if (sqlToHtml(column) === 'date') dateFields.push(column.columnName);
			});

			const getFilterRecords = () => {
				if (component.filter.getValues) component.filter.getValues((err, data) => {
					if (err) logError(err);
					if (data) component.filterRecords = data;
				});
				else logError(new Error('Filter does not contain function to get values'));
			};

			const getConstraintData = () => {
				component.schema.columns.forEach(column => {
					if (column.constraint && column.constraint.values && column.constraint.values.length > 0) {
						const values = [];
						column.constraint.values.forEach(result => {
							if (result.originalValue) {
								values.push(result);
							} else {
								const value = {
									key: result[column.constraint.foreignKey],
									label: column.constraint.foreignLabel ? result[column.constraint.foreignLabel] : result[column.constraint.foreignKey],
									originalValue: result
								};
								values.push(value);
							}
						});
						column.constraint.values = values;
					} else if (column.constraint && column.constraint.values && column.constraint.values.length < 1 && column.constraint.getValues) {
						column.constraint.getValues((err, data) => {
							if (err) logError(err);
							if (data) {
								const values = [];
								data.forEach(result => {
									const value = {
										key: result[column.constraint.foreignKey],
										label: column.constraint.foreignLabel ? result[column.constraint.foreignLabel] : result[column.constraint.foreignKey],
										originalValue: result
									};
									values.push(value);
								});
								column.constraint.values = values;
							}
						});
					}
				});
			};

			const fetchCriteriaStructure = () => {
				getCriteriaStructure(component.filter.databaseName, component.filter.tablePrefix, (err, data) => {
					if (err) logError(err);
					if (data) component.criteriaStructure = data;
				});
			};

			getConstraintData();
			if (component.filter) {
				getFilterRecords();
				if (component.filter.fetchCriteriaStructure) fetchCriteriaStructure();
			}
			if (!component.identifier.duplicate && component.identifier.value || component.identifier.duplicate && this.duplication.associations[stringFormats.camelCase(this.title || this.schema.title)]) if (!this.fetched) this.getExistingRecords();
		},
		beforeDestroy () {
			if (this.depends) if (this.depends.column) {
				if (!this.depends.test(this.$store.state[stringFormats.camelCase(this.$store.state.schema.title || this.$store.state.schema.table)][this.depends.column])) this.records = [];
			} else if (this.depends.association) {
				if (this.depends.useValues) {
					if (!this.depends.test(this.$store.state[stringFormats.camelCase(this.depends.association)].records, this.$store.state.schema)) this.records = [];
				} else if (!this.depends.test(this.$store.state[stringFormats.camelCase(this.depends.association)].records)) {
					this.records = [];
				}
			}
		},
		methods: {
			columnShouldBeDisplayed (column) {
				if (!this.identifier.value) {
					// If there's no identifier and the column is not the associated column
					if (column.columnName !== this.associatedColumn)

						// Show it if it's not automated
						return !column.automated;


					// Otherwise, don't
					return false;
				}

				// If there is an identifier, then show the column if no fields to
				// display were passed in, or if inserting is allowed and the column
				// is required, or if fields to display were passed in and the column
				// is one of those fields.
				if (column.automated) return false;

				return !this.fieldsToDisplay || this.allowInsert && column.required || this.fieldsToDisplay.indexOf(column.columnName) !== -1;
			},
			columnShouldBeEditable (column) {
				// Column is only editable if the fieldsToEdit array exists and contains
				// the column's name
				return (!this.identifier.value || this.identifier.key !== column.columnName) && (!this.fieldsToEdit || this.fieldsToEdit.indexOf(column.columnName) !== -1);
			},
			generateRecord (option) {
				// Create the record object
				const record = {};

				// Then loop through the schema's columns to set the appropriate values
				// in the record.
				this.schema.columns.forEach(column => {
					if (column.columnName === this.optionColumnName) record[column.columnName] = option.key;
					else if (column.columnName === this.associatedColumn) record[column.columnName] = this.identifier.value || null;
					else record[column.columnName] = null;
				});


				// Then return the record
				return record;
			},
			getExistingRecords () {
				getCriteriaStructure(this.schema.databaseName, this.schema.tablePrefix, (err, data) => {
					if (err) logError(err);
					if (data) {
						const critStruct = data;
						critStruct[this.identifier.criteriaString] = this.identifier.value;
						this.schema.fetchExisting(critStruct, (err, data) => {
							if (err) logError(err);
							if (data) {
								if (this.schema.prepareFromRetrieval) this.schema.prepareFromRetrieval(data, this.records);
								else data.forEach(existingRecord => {
									let foundMatch = false;
									this.records.forEach(record => {
										if (record[this.optionColumn.columnName] === existingRecord[this.optionColumn.columnName]) for (const key in record) if (existingRecord.hasOwnProperty(key) && record[key] === null) {
											record[key] = existingRecord[key];
											foundMatch = true;
										}
									});
									if (!foundMatch) this.oldRecords.push(existingRecord);
								});

								this.fetched = true;
							}
						});
					}
				});
			},
			getOptionLabel (key) {
				const optionKeys = this.filteredOptions.map(o => o.key);
				const optionLabels = this.filteredOptions.map(o => o.label);

				return optionLabels[optionKeys.indexOf(key)];
			},
			getPrettyColumnName,
			getRecordValue (option, column) {
				let value = null;
				this.records.forEach(record => {
					if (record[this.optionColumnName] === option[this.optionColumn.constraint.foreignKey]) value = record[column.columnName];
				});

				return value;
			},
			getSum (column) {
				let sum = 0;
				this.records.forEach(record => {
					sum += typeof record[column.columnName] === 'number' ? record[column.columnName] : 0;
				});

				return sum;
			},
			getUnfilteredOptionLabel (key) {
				const optionKeys = this.options.map(o => o.key);
				const optionLabels = this.options.map(o => o.label);

				return optionLabels[optionKeys.indexOf(key)];
			},
			recordExistsForId (id) {
				return this.records.map(r => r[this.associatedColumn]).indexOf(id) !== -1;
			},
			recordHasValue (record) {
				let hasValue = false;
				this.filteredColumns.forEach(column => {
					if (column.columnName !== this.optionColumnName && this.columnShouldBeEditable(column) && record[column.columnName] !== null && record[column.columnName] !== '') hasValue = true;
				});

				return hasValue;
			},
			sqlToHtml
		}
	};
</script>
