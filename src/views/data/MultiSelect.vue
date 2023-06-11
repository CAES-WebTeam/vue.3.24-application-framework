<template lang="html">
	<div v-if="displayedGroups.length > 0 && filteredOptions.length > 0">
		<!-- Show the title if there is one -->
		<div class="heading-wrapper">
			<h3 v-if="title || schema.title" :class="mode === 'view' ? 'inline' : ''">
				{{ (title || schema.title) + (mode === 'view' ? ':' : '') }}
				<a v-if="helpMessageName && mode === 'edit'" class="help-link" @click="$emit('show-help')">
					<HelpCircleIcon />
				</a>
			</h3>
			<em v-if="maxAllowed >= 0">({{records.length}}/{{maxAllowed}} Selected)</em>
		</div>

		<!-- Show the description if there's one of those too -->
		<p v-if="description && mode === 'edit'">
			{{ description }}
		</p>
		<!-- If no groups are present, say so -->
		<p v-if="groups.length < 1">
			(None)
		</p>
		<!-- Loop through each of the groups -->
		<div v-for="group in groups" :key="group.id">
			<!--
				And if either no groups to show were specified, or the current group
				made the cut...
			-->
			<transition appear name="fade">
				<div v-if="!groupsToShow || displayedGroups.indexOf(group.id) !== -1" class="group">
					<div v-if="mode === 'edit'">
						<!-- Show the group's name if there is one -->
						<h4 v-if="group.name">
							{{ group.name }}
						</h4>
						<!-- Then, create a list to hold each of the group's options -->
						<transition-group name="list-complete" tag="ul" class="checkbox">
							<li v-for="option in group.options" :key="option[optionID]" class="list-complete-item">
								<label>
									<!--
										Show a checkbox for the option, here's prop explanations:
										value: Set to a generated record object from the option
										v-model: Says where to store the record when checked
										disabled: Depends on whether editing is enabled or not.
									-->
									<input
										v-model="records"
										type="checkbox"
										:value="generateRecord(option)"
										:disabled="disableCheckbox(option[optionID])"
										@click="notifyOfChanges"
									/>
									<!-- The option's label -->
									<span>
										{{ option[optionLabel || optionID] }}
									</span>
									<!-- And the option's description if it has one -->
									<span v-if="optionDescription">
										: {{ option[optionDescription] }}
									</span>
								</label>
								<!-- <div v-else>
									<span>
										{{ option[optionLabel || optionID] }}
									</span>
									<span v-if="optionDescription">
										: {{ option[optionDescription] }}
									</span>
								</div> -->
							</li>
						</transition-group>
					</div>
					<div v-else>
						<strong v-if="group.name">
							{{ group.name }}:
						</strong>
						<span v-for="(option, index) in getOptionsThatHaveRecords(group.options)" :key="option[optionID]">
							{{ getViewModeOptionLabel(group, option, index) }}
						</span>
					</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
	/* global activeUserID */
	/* global notify */
	// Import required modules
	import HelpCircleIcon from 'vue-feather-icons/icons/HelpCircleIcon';
	import { filter } from '~/modules/criteriaUtils';
	import { constructNotificationMessage } from '~/modules/notifications';
	import { toKey } from '@gabegabegabe/utils/dist/array/mappers';
	import {
		getCriteriaStructure,
		logError
	} from '~/modules/caesdb';
	import {
		modeValidator,
		stringFormats
	} from '~/modules/utilities';

	// Export the actual component
	export default {
		// Component's name
		name: 'DataMultiSelect',
		components: { HelpCircleIcon },

		// Component's properties, which are set by the parent component
		props: {
			affects: {
				type: Object,
				default: null
			},

			// The column of the records to use as the value for the checkboxes
			associatedColumn: {
				type: String,
				required: true
			},

			// Description of the data
			description: {
				type: String,
				default: ''
			},

			// An object containing information for filtering out options
			filter: {
				type: Object,
				default: null
			},

			// The column to group records with
			groupBy: {
				type: String,
				default: ''
			},

			// The column to get the group labels from
			groupLabel: {
				type: String,
				default: ''
			},

			// An array or object specifying which groups should be displayed
			groupsToShow: {
				type: [Array, Object],
				default: null
			},

			// A string containing the name for this section's help message
			helpMessageName: {
				type: String,
				default: ''
			},

			// An identifier, used when viewing an existing record
			identifier: {
				type: Object,
				default: null
			},

			// Max Allowed
			maxAllowed: {
				type: Number,
				default: -1
			},

			// The display mode
			mode: {
				type: String,
				default: 'view',
				validator: modeValidator
			},

			// The main schema for the data
			schema: {
				type: Object,
				required: true
			},

			// Title of the fieldset
			title: {
				type: String,
				default: ''
			}
		},

		// Data must be a function, and it returns the simple variables that are to
		// be used by the component
		data () {
			// Create our main data object
			const data = {
				changeCount: 0,						// Used to track changes for notifications
				filterRecords: [],				// The array to store the filter's records in
				groups: [],								// Array to hold groups of options
				localRecords: [],					// Local records array, used if no data store
				optionDescription: null,	// The column holding the option's description
				optionID: null,						// The column holding the option's ID
				optionLabel: null,				// The column holding the option's label
				options: []								// The array to hold all, unfiltered, options
			};

			// We need to loop through each of the schema's columns to find the column
			// that has the constraint pertaining to the options to be selected so
			// that we can extract the ID, Label, and Description column names
			this.schema.columns.forEach(column => {
				// If the column's name is the associated column and the column has a
				// constraint, it's the one we're looking for!
				if (column.columnName === this.associatedColumn && column.constraint) {
					// So, set the ID, Label, and Description values accordingly.  If no
					// description, set description to false.
					data.optionID = column.constraint.foreignKey;
					data.optionLabel = column.constraint.foreignLabel;
					data.optionDescription = column.constraint.foreignDescription || false;
				}
			});

			// Finally, return the data!
			return data;
		},

		// Computed values are values that are generated by a function rather than
		// just plain variables
		computed: {
			duplication () {
				return this.$store.state.duplication;
			},
			fetched: {
				get () { return this.$store.state[stringFormats.camelCase(this.title || this.schema.title)].fetched; },
				set (val) { this.$store.state[stringFormats.camelCase(this.title || this.schema.title)].fetched = val; }
			},
			showNotifications () { return this.$store.state.preferences.showNotificationsForChanges; },

			// Records is used to hold the checked options
			records: {
				get () {
					// If there's a store, return the store's records, if not just return
					// the local records array
					return this.$store ? this.$store.state[stringFormats.camelCase(this.title || this.schema.title)].records : this.localRecords;
				},
				set (val) {
					// Same boat.  If a store, use that, if not use local.
					if (this.$store) this.$store.state[stringFormats.camelCase(this.title || this.schema.title)].records = val;
					else this.localRecords = val;
				}
			},

			// Displayed groups is an array of group IDs, used to determine if a group
			// will display on the page or not.
			displayedGroups: {
				get () {
					// If the groupsToShow property was not specified, return empty array
					if (!this.groupsToShow) return [-1];

					// If the groupsToShow property is already an array of values, use it
					if (Array.isArray(this.groupsToShow)) return this.groupsToShow;
					if (!this.groupsToShow.association || !this.groupsToShow.column) {
						// If groupsToShow has an association without a specified column,
						// we're in an error state so log it to the console.
						logError(new Error('Groups to show must either be an array or an object containing an association and a column.'));
					} else if (!this.$store) {
						// If no datastore is present, we're in an error state since we need
						// to be able to access data outside this component's scope
						logError(new Error('Cannot restrict displayed groups when not using a data store.'));
					} else {
						// Else, we're good.  We just need to create a mapped array from the
						// component's group records
						const displayedGroups = this.groupRecords.map(record => record[this.groupsToShow.column]);


						// And return it
						return displayedGroups;
					}


					// If we haven't returned anything yet, just send an empty array
					return [];
				}
			},

			// Get the associated group's records from the datastore
			groupRecords: {
				get () {
					if (this.groupsToShow) return this.$store.state[stringFormats.camelCase(this.groupsToShow.association)].records;

					return [];
				}
			},

			// Takes all available options and filters them based on the configuration
			// specified in the schema
			filteredOptions: {
				get () {
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
						const associatedValues = [];

						// Get the records from the specified association in the store
						this.$store.state[stringFormats.camelCase(association.title)].records.forEach(record => {
							// If our associated values array doesn't have the record yet, add
							// it.
							if (associatedValues.indexOf(record[association.column]) === -1) associatedValues.push(record[association.column]);
						});

						// If values have been set on the association, then we can assume
						// we've successfully processed that association.  So, increment our
						// counter.
						if (associatedValues.length > 0) associationsSelected++;

						// And push those values the criteria structure specified in the
						// filter.
						this.filter.criteriaStructure[`criteria_${association.criteriaColumn || association.column}_eq`] = associatedValues;
					});

					// Once our criteria structure is populated with values, run the
					// filter function to get the filtered records.
					const filteredRecords = filter(this.filterRecords, this.filter.criteriaStructure);

					// Then grab the values from those filtered records.
					const filteredValues = filteredRecords.map(r => r[this.filter.optionColumn]);

					// Create an empty array to hold them
					const filteredOptions = [];

					// Loop through each of the options
					this.options.forEach(option => {
						// And if the option's value is in the filteredValues array, push
						// the option into our filtered options array
						if (filteredValues.indexOf(option[this.optionID]) !== -1) filteredOptions.push(option);
					});


					// If our counter says we've got all the data for all associations,
					// return our filtered options.  If all associations have not been
					// satisfied, return an empty array.
					return associationsSelected === this.filter.associations.length ? filteredOptions : [];
				}
			},

			// An array of just the values of the options of the checked groups
			validOptions: {
				get () {
					// Create an empty array to hold them
					let validOptions = [];

					// Map the groups to an array of just the group names
					const groupsMap = this.groups.map(g => g.id);

					// Loop through each of the displayed groups
					this.displayedGroups.forEach(group => {
						// Get the index of that group
						const groupIndex = groupsMap.indexOf(group);

						// If the group index is not negative one, it must be checked
						if (groupIndex !== -1)

							// So, append its values to the valid options array
							validOptions = validOptions.concat(this.groups[groupIndex].options.map(o => o[this.optionID]));
					});


					// Finally, return the array
					return validOptions;
				}
			}
		},

		// Holds functions corresponding to computed values that will be run every
		// time the computed value changes.
		watch: {
			duplication: {
				handler () {
					if (this.identifier.duplicate && this.duplication.associations[stringFormats.camelCase(this.title || this.schema.title)]) this.getRecords();
				},
				deep: true
			},

			// We need to watch filtered options so that we can populate the group's
			// array of options with the filtered ones.
			filteredOptions () {
				// Define our populate groups function
				const populateGroups = () => {
					// Start with an empty array
					this.groups = [];
					if (!this.groupBy)

						// If the component's groupBy property wasn't specified, just push a
						// single group containing all filtered options into the groups array.
						this.groups.push({
							id: -1,
							options: this.filteredOptions
						});
					else

						// Else, we need to loop through each of the options
						this.options.forEach(option => {
							// And get the index of the option's group in the existing groups
							// array.
							const groupsIndex = this.groups.map(e => e.name).indexOf(this.groupLabel ? option[this.groupLabel] : option[this.groupBy]);
							if (groupsIndex === -1)

								// If the group is not present, push a new group in, containing
								// the option
								this.groups.push({
									id: option[this.groupBy],
									name: this.groupLabel ? option[this.groupLabel] : option[this.groupBy],
									options: [option]
								});
							else

								// If the group is present...
								if (this.groups[groupsIndex].options.indexOf(option) === -1)

									// And the option is not, push it in.
									this.groups[groupsIndex].options.push(option);
						});
				};

				// Run our group populator function
				populateGroups();
			},

			// We need to watch validOptions so that we can remove invalid records
			// from the component's records array.  If we didn't, then a group could
			// be unchecked but its options could still be selected.
			validOptions () {
				// Start with an empty array to hold good records
				const validRecords = [];

				// Loop through the component's existing records
				this.records.forEach(record => {
					// And check to see if the record's value is in the valid options
					// array.
					const validOptionsIndex = this.validOptions.indexOf(record[this.associatedColumn]);

					// If it is, push that record into the valid records array
					if (validOptionsIndex !== -1) validRecords.push(record);
				});

				// Finally, set the component's records equal to the valid records.
				// TODO: This is a nasty hack that prevents records from being lost.
				// Ideally, those records *should* be lost if valid options is empty,
				// however for somereason valid options is empty when it shouldn't be.
				// This hackishly fixes it.
				if (this.validOptions.length > 0) this.records = validRecords;
			}
		},

		// The mounted function is run every time the component is mounted/rendered
		// onto the page.
		mounted () {
			// Alias 'this' to component
			const component = this;

			// Function to get all options available
			const getOptions = () => {
				// Loop through the schema's columns looking for the associated column
				// with a constraint
				component.schema.columns.forEach(column => {
					if (column.columnName === component.associatedColumn && column.constraint && column.constraint.values && column.constraint.values.length > 0) component.options = column.constraint.values;
					else if (column.columnName === component.associatedColumn && column.constraint && column.constraint.getValues) if (column.constraint.tablePrefix) {
						// If the constraint has a tablePrefix, we need to get a criteria
						getCriteriaStructure(column.constraint.databaseName, column.constraint.tablePrefix, (err, criteriaStructure) => {
							if (err) logError(err);
							criteriaStructure[column.constraint.criteria.string] = column.constraint.criteria.useUserID ? activeUserID : column.constraint.criteria.value;
							column.constraint.getValues(criteriaStructure, (err, data) => {
								if (err) logError(err);
								if (data) component.options = data;
							});
						});
					} else {
						// If no table prefix, just fetch the data
						column.constraint.getValues((err, data) => {
							if (err) logError(err);
							if (data) component.options = data;
						});
					}
					else if (column.columnName === component.associatedColumn)

						// If we find the associated column but it doesn't have a constraint
						// we're in an error condition, so log it to the console.
						logError(new Error('ID Column does not have necessary constraint information.'));
				});
			};

			// Gets records used to filter options
			const getFilterRecords = () => {
				if (component.filter.getValues) component.filter.getValues((err, data) => {
					if (err) logError(err);
					if (data) component.filterRecords = data;
				});
				else logError(new Error('Filter does not contain function to get values'));
			};

			// Get our options
			getOptions();

			// If an identifier is present, get the existing records
			if (!component.identifier.duplicate && component.identifier.value || component.identifier.duplicate && this.duplication.associations[stringFormats.camelCase(this.title || this.schema.title)]) if (!this.fetched) this.getRecords();


			// If a filter was specified, get the filter records
			if (component.filter) getFilterRecords();
		},

		// Methods/functions that are available to the component during render (and
		// elsewhere)
		methods: {
			// The function to check all the boxes of a group when clicked
			checkAll (group) {
				// Loop through the group's options
				group.options.forEach(option => {
					// Generate a record from the option
					const record = this.generateRecord(option);

					// Then see if the record is already in our records array and if it
					// isn't, add it.
					const recordIndex = this.records.map(e => e[this.associatedColumn]).indexOf(record[this.associatedColumn]);
					if (recordIndex === -1)	this.records.push(record);
				});
			},

			// Function to uncheck all options of a group when clicked.  Basically the
			// opposite of the checkAll function (can you believe it?!)
			uncheckAll (group) {
				group.options.forEach(option => {
					const record = this.generateRecord(option);
					const recordIndex = this.records.map(e => e[this.associatedColumn]).indexOf(record[this.associatedColumn]);
					if (recordIndex !== -1) this.records.splice(recordIndex, 1);
				});
			},

			disableCheckbox (value) {
				if (this.maxAllowed < 0) return false;
				if (this.records.length < this.maxAllowed) return false;
				if (this.records.map(toKey(this.associatedColumn)).indexOf(value)===-1) return true;
				return false;
			},

			getOptionsThatHaveRecords (options) {
				const newOptions = [];
				options.forEach(option => {
					if (this.recordExistsForId(option[this.optionID])) newOptions.push(option);
				});

				return newOptions;
			},
			getViewModeOptionLabel (group, option, index) {
				let label = option[this.optionLabel || this.optionID];
				if (index < this.getOptionsThatHaveRecords(group.options).length - 1) label += ',';

				return label;
			},

			// Generates a record from an option, to be stored in the component's
			// records array
			generateRecord (option) {
				// Create the record object
				const record = {};

				// Then loop through the schema's columns to set the appropriate values
				// in the record.
				this.schema.columns.forEach(column => {
					if (column.columnName === this.associatedColumn) record[column.columnName] = option[this.optionID];
					else record[column.columnName] = this.identifier.value || null;
				});


				// Then return the record
				return record;
			},
			getRecords () {
				getCriteriaStructure(this.schema.databaseName, this.schema.tablePrefix, (err, data) => {
					if (err) logError(err);
					if (data) {
						const critStruct = data;
						critStruct[this.identifier.criteriaString] = this.identifier.value;
						this.schema.fetchExisting(critStruct, (err, data) => {
							if (err) logError(err);
							if (data) {
								const convertedRecords = [];
								data.forEach(record => {
									const convertedRecord = {};
									this.schema.columns.forEach(column => {
										convertedRecord[column.columnName] = record[column.columnName];
									});
									convertedRecords.push(convertedRecord);
								});
								this.records = convertedRecords;
								this.fetched = true;
							}
						});
					}
				});
			},
			recordExistsForId (id) {
				return this.records.map(r => r[this.associatedColumn]).indexOf(id) !== -1;
			},
			notifyOfChanges () {
				if (!this.showNotifications) return;
				if (this.affects && (this.affects.showAlways || this.changeCount < 1)) {
					const notification = notify.log(constructNotificationMessage(this.title, this.affects.titles));
					notification.addEventListener('click', e => {
						if (!e.target.matches('.notify-button.hide-notifications')) return;
						this.$store.commit('preferences/hideNotifications');
						Array.from(notification.parentNode.children).forEach(el => {
							el.parentNode.removeChild(el);
						});
					});
				}
				++this.changeCount;
			}
		}
	};
</script>

<style lang="scss" scoped>
	div.group {
		padding: 0 1rem;
	}

	div.heading-wrapper{
		align-items: center;
		display: flex;
	}

	span.group-name {
		font-size: .85rem;
		font-weight: 600;
		border-bottom: .05rem solid #000;
	}
</style>
