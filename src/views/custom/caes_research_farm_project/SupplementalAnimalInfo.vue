<template lang="html">
	<section>
		<h3 class="head">
			Animal Science Projects
		</h3>
		<p v-if="mode === 'edit'">
			NOTE: An Animal Use Protocol (AUP) must be completed for each project
			involving animals, even if no treatments are applied to the animals and no
			data are collected from the animals. This would include, for example,
			studies in which animals are used for grazing trials or used to	create
			runoff in field studies.
		</p>
		<div>
			<h3>
				General Animal Project Info
			</h3>
			<div v-if="mode === 'edit'">
				<p>
					<label>
						<h4>AUP Number <em class="required-asterisk">*</em></h4>
						<input v-model="record.AUP_NUMBER" type="text" required />
					</label>
				</p>
				<p>
					<label>
						<h4>{{ columns.NUMBER.prettyName }}</h4>
						<input v-model="record.NUMBER" type="text" />
					</label>
				</p>
				<p>
					<label>
						<h4>{{ columns.DESCRIPTION.prettyName }}</h4>
						<input v-model="record.DESCRIPTION" type="text" />
					</label>
				</p>
				<p class="flex row wrap">
					<label>
						<h4>{{ columns.SOURCE.prettyName }}</h4>
						<!-- <input v-model="record.SOURCE" type="text" /> -->
						<select v-model="tempSourceSelection">
							<option value="">(Select One)</option>
							<option v-for="source in sourceOptions" :key="source">
								{{ source }}
							</option>
						</select>
					</label>
					<label v-if="showSourceInput">
						<h5>Please Describe Outside Source</h5>
						<input v-model="tempSourceInput" type="text" />
					</label>
				</p>
				<p class="flex row wrap">
					<label>
						<h4>{{ columns.FINAL_DISPOSITION.prettyName }}</h4>
						<!-- <input v-model="record.FINAL_DISPOSITION" type="text" /> -->
						<select v-model="tempDispositionSelection">
							<option value="">(Select One)</option>
							<option v-for="disposition in dispositionOptions" :key="disposition">
								{{ disposition }}
							</option>
						</select>
					</label>
					<label v-if="showDispositionInput">
						<h5>Please Describe Other Disposition</h5>
						<input v-model="tempDispositionInput" type="text" />
					</label>
				</p>
			</div>
			<div v-else>
				<h4>AUP Number</h4>
				<p>{{ record.AUP_NUMBER }}</p>
				<h4>{{ columns.NUMBER.prettyName }}</h4>
				<p>{{ record.NUMBER }}</p>
				<h4>{{ columns.DESCRIPTION.prettyName }}</h4>
				<p>{{ record.DESCRIPTION }}</p>
				<h4>{{ columns.SOURCE.prettyName }}</h4>
				<p>{{ record.SOURCE }}</p>
				<h4>{{ columns.FINAL_DISPOSITION.prettyName }}</h4>
				<p>{{ record.FINAL_DISPOSITION }}</p>
			</div>
		</div>
		<div>
			<h3>
				Animal Feeding Information
			</h3>
			<div v-if="mode === 'edit'">
				<p>
					<label>
						<h4>{{ columns.FEEDING_REGIME.prettyName }}</h4>
						<textarea v-model="record.FEEDING_REGIME"></textarea>
					</label>
				</p>
				<p>
					<label>
						<h4>{{ columns.TOTAL_FEED_AMOUNT.prettyName }}</h4>
						<input v-model="record.TOTAL_FEED_AMOUNT" type="text" />
					</label>
				</p>
				<p>
					<label>
						<h4>{{ columns.FEED_STORAGE_LOCATION.prettyName }}</h4>
						<input v-model="record.FEED_STORAGE_LOCATION" type="text" />
					</label>
				</p>
			</div>
			<div v-else>
				<h4>{{ columns.FEEDING_REGIME.prettyName }}</h4>
				<p>{{ record.FEEDING_REGIME }}</p>
				<h4>{{ columns.TOTAL_FEED_AMOUNT.prettyName }}</h4>
				<p>{{ record.TOTAL_FEED_AMOUNT }}</p>
				<h4>{{ columns.FEED_STORAGE_LOCATION.prettyName }}</h4>
				<p>{{ record.FEED_STORAGE_LOCATION }}</p>
			</div>
		</div>
		<div>
			<h3>
				Responsibilities By Task
			</h3>
			<p>
				(Where applicable, please provide detailed instructions to the REC staff
				in the boxes below.)
			</p>
			<table>
				<thead>
					<tr>
						<th>Task</th>
						<th>Special Instructions</th>
						<th>Responsible Party</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="columnGroup in tableGroups" :key="columnGroup.name">
						<td>{{ columnGroup.textColumn.prettyName || getPrettyColumnName(columnGroup.textColumn.columnName) }}</td>
						<td>
							<textarea v-if="mode === 'edit'" v-model="record[columnGroup.textColumn.columnName]"></textarea>
							<p v-else>
								{{ record[columnGroup.textColumn.columnName] }}
							</p>
						</td>
						<td>
							<!-- <select v-if="mode === 'edit'" v-model="record[columnGroup.partyColumn.columnName]">
								<option
									v-for="option in responsiblePartyOptions"
									:key="option.ID"
									:value="option.ID"
								>
									{{ option.NAME }}
								</option>
							</select> -->
							<div v-if="mode === 'edit'">
								<label v-for="option in responsiblePartyOptions" :key="option.ID" class="radio">
									<input
										v-model="record[columnGroup.partyColumn.columnName]"
										type="radio"
										:value="option.ID"
										:disabled="mode === 'view'"
									/>
									<span>{{ option.NAME }}</span>
								</label>
							</div>
							<span v-else>
								{{ getResponiblePartyNameFromId(record[columnGroup.partyColumn.columnName]) }}
							</span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div v-if="mode === 'edit'">
			<label>
				<h4>{{ columns.SPECIAL_NEEDS.prettyName }}</h4>
				<textarea v-model="record.SPECIAL_NEEDS"></textarea>
			</label>
		</div>
		<div v-else>
			<h4>{{ columns.SPECIAL_NEEDS.prettyName }}</h4>
			<p>{{ record.SPECIAL_NEEDS }}</p>
		</div>
		<div>
			<h3>Important Dates</h3>
			<table>
				<thead>
					<tr>
						<th
							v-for="column in columnsToBeDisplayed"
							:key="column.columnName"
						>
							{{ column.prettyName || getPrettyColumnName(column.columnName) }}
						</th>
						<th v-if="mode === 'edit'">
							&nbsp;
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="importantDate in record.importantDates" :key="JSON.stringify(importantDate)">
						<td v-for="column in columnsToBeDisplayed" :key="column.columnName">
							<SmartInput
								v-if="mode === 'edit'"
								v-model="importantDate[column.columnName]"
								:display-label="false"
								:field="column"
								:fetched="fetched"
							/>
							<p v-else>
								{{ importantDate[column.columnName] }}
							</p>
						</td>
						<td v-if="mode === 'edit'">
							<button class="button" type="button" @click="removeImportantDate(importantDate)">
								Remove
							</button>
						</td>
					</tr>
					<tr v-if="mode === 'edit'">
						<td v-for="column in columnsToBeDisplayed" :key="column.columnName">
							<SmartInput
								v-model="newImportantDate[column.columnName]"
								:display-label="false"
								:field="column"
								:fetched="fetched"
							/>
						</td>
						<td>
							<button
								class="button"
								type="button"
								:disabled="!newImportantDateIsValid"
								@click="addNewImportantDate"
							>
								Add
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>
</template>

<script>
	/* global caesCache */
	import importantDateSchema from '~/schemas/caes_research_farm_project/important_date';
	import supplementalAnimalInfoSchema from '~/schemas/caes_research_farm_project/supplemental_animal_info';
	import SmartInput from '~/views/elements/SmartInput';
	import {
		asyncGetCriteriaStructure,
		logError
	} from '~/modules/caesdb';
	import {
		formatDates,
		getObjectIndexedByKeyFromArray,
		getPrettyColumnName,
		url
	} from '~/modules/utilities';

	export default {
		name: 'SupplementalAnimalInfo',
		components: { SmartInput },
		props: {
			mode: {
				type: String,
				required: true
			}
		},
		data () {
			return {
				columns: getObjectIndexedByKeyFromArray(supplementalAnimalInfoSchema.columns, 'columnName'),
				dispositionOptions: [
					'Return to Resident Herd',
					'Sell',
					'Harvest',
					'Other'
				],
				importantDateSchema,
				localRecord: {
					...supplementalAnimalInfoSchema.columns.reduce((out, column) => {
						out[column.columnName] = null;

						return out;
					}, {}),
					importantDates: []
				},
				newImportantDate: importantDateSchema.columns.reduce((output, column) => {
					output[column.columnName] = null;

					return output;
				}, {}),
				responsiblePartyOptions: caesCache.data.crfp.responsibleParty,
				schema: supplementalAnimalInfoSchema,
				showSourceInput: false,
				showDispositionInput: false,
				sourceOptions: ['Resident Herd', 'Other Station', 'Outside Source'],
				tempSourceSelection: '',
				tempSourceInput: '',
				tempDispositionSelection: '',
				tempDispositionInput: ''
			};
		},
		computed: {
			columnsToBeDisplayed () { return importantDateSchema.columns.filter(c => !c.automated); },
			fetched: {
				get () { return this.$store.state.supplementalAnimalInformation.fetched; },
				set (val) { this.$store.state.supplementalAnimalInformation.fetched = val; }
			},
			duplicateId () {
				return [
					'duplicateId',
					'duplicateID',
					'DUPLICATEID',
					'duplicateid',
					'DuplicateID',
					'DuplicateId',
					'DuPlIcAtEiD'
				].reduce((duplicateId, param) => {
					if (url.getParam(param) !== null) duplicateId = url.getParam(param);

					return duplicateId;
				}, false);
			},
			isDuplicate () { return this.duplicateId !== false; },
			isNew () { return this.$store.state.project.ID === null; },
			newImportantDateIsValid () {
				return importantDateSchema.columns.reduce((isValid, column) => {
					const val = this.newImportantDate[column.columnName];
					if (!column.automated && column.required && !val) isValid = false;

					return isValid;
				}, true);
			},
			record: {
				get () {
					const { records } = this.$store.state.supplementalAnimalInformation;
					if (records.length < 1) return this.localRecord;

					return records[0];
				},
				set (val) {
					const { records } = this.$store.state.supplementalAnimalInformation;
					if (records.length < 1) records.push(val);
					records[0] = val;
				}
			},
			shouldBeDuplicated () {
				if (!this.$store.state.duplication) return false;
				if (!this.$store.state.duplication.associations) return false;

				return this.$store.state.duplication.associations.supplementalAnimalInformation === true;
			},
			tableGroups () {
				const tableGroups = [];
				this.schema.columns
					.filter(column => column.tableGroup)
					.forEach(column => {
						const indexOfGroup = tableGroups.map(g => g.name).indexOf(column.tableGroup.name);
						if (indexOfGroup === -1) {
							const groupObj = { name: column.tableGroup.name };
							groupObj[`${column.tableGroup.class}Column`] = column;
							tableGroups.push(groupObj);
						} else {
							tableGroups[indexOfGroup][`${column.tableGroup.class}Column`] = column;
						}
					});

				return tableGroups;
			}
		},
		watch: {
			tempSourceInput (val) { if (val) this.record.SOURCE = val; },
			tempSourceSelection (val) {
				if (val !== 'Outside Source') {
					this.showSourceInput = false;
					this.record.SOURCE = val;
				} else {
					this.showSourceInput = true;
					if (this.record.SOURCE && this.sourceOptions.indexOf(this.record.SOURCE) === -1) {
						this.tempSourceInput = this.record.SOURCE;
					} else {
						this.record.SOURCE = val;
						this.tempSourceInput = '';
					}
				}
			},
			tempDispositionInput (val) { if (val) this.record.FINAL_DISPOSITION = val; },
			tempDispositionSelection (val) {
				if (val !== 'Other') {
					this.showDispositionInput = false;
					this.record.FINAL_DISPOSITION = val;
				} else {
					this.showDispositionInput = true;
					if (this.record.FINAL_DISPOSITION && this.dispositionOptions.indexOf(this.record.FINAL_DISPOSITION) === -1) {
						this.tempDispositionInput = this.record.FINAL_DISPOSITION;
					} else {
						this.record.FINAL_DISPOSITION = val;
						this.tempDispositionInput = '';
					}
				}
			}
		},
		mounted () {
			const { records } = this.$store.state.supplementalAnimalInformation;
			if (records.length < 1) records.push(this.localRecord);
			else this.localRecord = records[0];

			if (!this.isNew) this.fetchExistingData(this.$store.state.project.ID);
			else if (this.isDuplicate && this.shouldBeDuplicated) this.fetchExistingData(this.duplicateId);
		},
		methods: {
			addNewImportantDate () {
				this.record.importantDates.push(this.newImportantDate);
				this.newImportantDate = importantDateSchema.columns.reduce((output, column) => {
					output[column.columnName] = null;

					return output;
				}, {});
			},
			fetchExistingData (projectId) {
				const getAnimalInfoCritStruct = async () => {
					try {
						const critStruct = await asyncGetCriteriaStructure(this.schema.databaseName, this.schema.tablePrefix);

						return critStruct;
					} catch (err) {
						logError(err);
					}
				};
				const getImportantDateCritStruct = async () => {
					try {
						const critStruct = await asyncGetCriteriaStructure(this.importantDateSchema.databaseName, this.importantDateSchema.tablePrefix);

						return critStruct;
					} catch (err) {
						logError(err);
					}
				};
				const getImportantDates = async animalInfoId => {
					const critStruct = await getImportantDateCritStruct();
					if (!critStruct) return;
					critStruct[this.importantDateSchema.criteria.string] = animalInfoId;
					try {
						const result = await this.importantDateSchema.fetchExisting(critStruct);
						if (result.success) {
							formatDates(this.importantDateSchema.columns.filter(c => c.type === 'datetime').map(c => c.columnName), result.data);
							const keysToSkipIfDuplicate = ['SUPPLEMENTAL_ANIMAL_INFO_ID'];
							result.data.forEach(importantDate => {
								if (this.isDuplicate) keysToSkipIfDuplicate.forEach(key => {
									importantDate[key] = null;
								});

								this.record.importantDates.push(importantDate);
							});
							this.fetched = true;
						}
					} catch (err) {
						logError(err);
					}
				};
				const getAnimalInfo = async () => {
					const critStruct = await getAnimalInfoCritStruct();
					if (!critStruct) return;
					critStruct[this.schema.criteria.string] = projectId;
					try {
						const result = await this.schema.fetchExisting(critStruct);
						if (result.success) {
							if (result.data.length > 0) {
								const animalInfo = result.data[0];
								const keysToSkipIfDuplicate = ['ID', 'PROJECT_ID'];
								for (const key in this.record) {
									if (this.isDuplicate && keysToSkipIfDuplicate.indexOf(key) !== -1) continue;
									if (animalInfo[key]) this.record[key] = animalInfo[key];
								}
								if (animalInfo.SOURCE) if (this.sourceOptions.indexOf(animalInfo.SOURCE) === -1) {
									this.tempSourceSelection = 'Outside Source';
									this.tempSourceInput = animalInfo.SOURCE;
								} else {
									this.tempSourceSelection = animalInfo.SOURCE;
								}

								if (animalInfo.FINAL_DISPOSITION) if (this.dispositionOptions.indexOf(animalInfo.FINAL_DISPOSITION) === -1) {
									this.tempDispositionSelection = 'Other';
									this.tempDispositionInput = animalInfo.FINAL_DISPOSITION;
								} else {
									this.tempDispositionSelection = animalInfo.FINAL_DISPOSITION;
								}

								getImportantDates(animalInfo.ID);
							}
							this.fetched = true;
						} else {
							logError(result.err);
						}
					} catch (err) {
						logError(err);
					}
				};

				if (!this.fetched) getAnimalInfo();
			},
			getPrettyColumnName,
			getResponiblePartyNameFromId (id) {
				if (!id) return null;
				const index = this.responsiblePartyOptions.map(o => o.ID).indexOf(id);
				if (index === -1) return 'Unknown';

				return this.responsiblePartyOptions[index].NAME || 'Unknown';
			},
			removeImportantDate (importantDate) {
				const index = this.record.importantDates.map(d => JSON.stringify(d)).indexOf(JSON.stringify(importantDate));
				this.record.importantDates.splice(index, 1);
			}
		}
	};
</script>

<style lang="scss" scoped>
	label.checkbox, label.radio {
		display: flex; padding: .25rem 0;
		input { margin-right: 1rem; }
		span { flex-grow: 1; }
	}
	em.required-asterisk { color: #6c3129; }
	table tbody tr {
		td:nth-child(2) {width: 50%;}
	}
	p.flex.row.wrap {
		display: flex;
		flex-wrap: wrap;
		& > * {
			margin-right: 1rem;
			&:last-of-type { margin-right: 0; }
		}
	}
</style>
