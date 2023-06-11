<template lang="html">
	<div>
		<!-- Planned Program -->
		<div>
			<label>
				<h3>
					Type of Issue
				</h3>
				<select v-model="issueType">
					<option value="local">
						Local
					</option>
					<option value="state">
						State
					</option>
				</select>
			</label>
			<label v-if="issueType === 'local'">
				<h3>
					Local Issue
				</h3>
				<select v-if="plannedPrograms.length > 0" v-model="record.PLANNED_PROGRAM_ID">
					<option v-for="program in plannedPrograms" :key="program.ID" :value="program.ID">
						{{ program.NAME }}
					</option>
				</select>
				<p v-else>
					<em>
						There are no local issues associated with your account.
					</em>
				</p>
			</label>
			<label v-else-if="issueType === 'state'">
				<h3>
					State Issue
				</h3>
				<select v-model="record.STATE_PLANNED_PROGRAM_ID">
					<option v-for="program in statePlannedPrograms" :key="program.ID" :value="program.ID">
						{{ program.NAME }}
					</option>
				</select>
			</label>
		</div>
		<!-- Roles -->
		<div>
			<h3>
				Roles
			</h3>
			<ul v-if="reportType !== -1" class="checkbox">
				<li v-for="role in roleTypes" :key="role.ROLE_ID">
					<label>
						<input v-model="roles" type="checkbox" :value="generateRoleRecord(role)" />
						<span>
							{{ role.SUB_REPORT_ROLE_LABEL }}
						</span>
					</label>
				</li>
			</ul>
		</div>
		<!-- Contacts  -->
		<table v-if="contacts.length > 0">
			<caption>
				Contacts
			</caption>
			<thead>
				<tr>
					<th>
						Contact Type
					</th>
					<th>
						Quantity
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="contact in contacts" :key="contact.TYPE_ID">
					<td>
						{{ getContactLabelFromID(contact.TYPE_ID) }}
					</td>
					<td>
						<input v-model.number="contact.QUANTITY" type="number" min="0" />
					</td>
				</tr>
			</tbody>
			<tfoot>
				<tr>
					<td>
						Total
					</td>
					<td>
						{{ totalContacts }}
					</td>
				</tr>
			</tfoot>
		</table>
		<!-- Supplemental Data -->
		<SupplementalData :for-sub-report="true" />
		<!-- Outcome, Impact, Achievements -->
		<div>
			<label>
				<h3>
					Outcome, Impact, and Achievements
				</h3>
				<div v-for="outcome in outcomes" :key="outcome.ID">
					<textarea v-model="outcome.MEMO"></textarea>
				</div>
			</label>
		</div>
	</div>
</template>

<script>
	/* global activeUserID */
	import SupplementalData from '~/views/custom/gacounts3/SupplementalData';
	import {
		getCriteriaStructure,
		logError
	} from '~/modules/caesdb';
	import {
		getAssociationReportTypeContactType,
		getAssociationReportTypeRole,
		getAssociationSubReportField,
		getAssociationSubReportRole,
		getContactTypes,
		getPlannedPrograms,
		getStatePlannedPrograms,
		getSubReport,
		getSubReportContact,
		getSubReportPurposeAchievements
	} from '~/modules/caesdb/gacounts3';
	import { filter } from '~/modules/criteriaUtils';
	import { url } from '~/modules/utilities';

	export default {
		name: 'SubReportForReport',
		components: {
			SupplementalData
		},
		data () {
			return {
				contactTypes: [],
				criteriaStructureTemplates: {
					associationReportTypeContactType: {},
					associationReportTypeRole: {},
					subReport: {}
				},
				issueType: 'local',
				plannedPrograms: [],
				statePlannedPrograms: [],
				unfilteredRoleTypes: []
			};
		},
		computed: {
			contacts: {
				get () {
					return this.$store.state.subschemas.subReport.contacts.records;
				},
				set (val) {
					this.$store.state.subschemas.subReport.contacts.records = val;
				}
			},
			criteriaStructures () {
				const critStructs = {
					associationReportTypeContactType: { ...this.criteriaStructureTemplates.associationReportTypeContactType },
					associationReportTypeRole: { ...this.criteriaStructureTemplates.associationReportTypeRole }
				};
				const reportTypes = this.$store.state.reportType.records.map(r => r.TYPE_ID);
				critStructs.associationReportTypeContactType.criteria_REPORT_TYPE_ID_eq = reportTypes;
				critStructs.associationReportTypeRole.criteria_TYPE_ID_eq = reportTypes;

				return critStructs;
			},
			neededReportValues () {
				return {
					report: {
						USER_ID: this.$store.state.report.OWNER_ID,
						ACTUAL_SUBMITTER_ID: this.$store.state.report.ACTUAL_SUBMITTER_ID,
						REPORT_ID: this.$store.state.report.ID
					},
					contacts: this.$store.state.contacts.records
				};
			},
			outcomes: {
				get () {
					return this.$store.state.subschemas.subReport.outcomeImpactAndAchievements.records;
				},
				set (val) {
					this.$store.state.subschemas.subReport.outcomeImpactAndAchievements.records = val;
				}
			},
			record: {
				get () {
					return this.$store.state.subschemas.subReport.subReport;
				},
				set (val) {
					this.$store.state.subschemas.subReport.subReport = val;
				}
			},
			reportId () {
				return this.$store.state.report.ID;
			},
			reportType () {
				const reportTypeRecords = this.$store.state.reportType.records;

				return reportTypeRecords.length > 0 ? reportTypeRecords[0].TYPE_ID : -1;
			},
			roles: {
				get () {
					return this.$store.state.subschemas.subReport.roles.records;
				},
				set (val) {
					this.$store.state.subschemas.subReport.roles.records = val;
				}
			},
			roleTypes () {
				return filter(this.unfilteredRoleTypes, this.criteriaStructures.associationReportTypeRole);
			},
			supplementalData: {
				get () {
					return this.$store.state.subschemas.subReport.supplementalData.records;
				},
				set (val) {
					this.$store.state.subschemas.subReport.supplementalData.records = val;
				}
			},
			totalContacts () {
				let sum = 0;
				this.contacts.forEach(contact => {
					sum += Number(contact.QUANTITY);
				});

				return sum;
			}
		},
		watch: {
			neededReportValues (values) {
				this.importReportData();
				this.populateContactsRecords();
			}
		},
		mounted () {
			this.importReportData();
			this.populateContactsRecords();
			this.populateOutcomeRecord();
			getCriteriaStructure('GACOUNTS3', 'GC3_ASSOCIATION_REPORT_TYPE_CONTACT_TYPE', (err, data) => {
				if (err) logError(err);
				if (data) this.criteriaStructureTemplates.associationReportTypeContactType = data;
			});
			getCriteriaStructure('GACOUNTS3', 'GC3_ASSOCIATION_REPORT_TYPE_ROLE', (err, data) => {
				if (err) logError(err);
				if (data) this.criteriaStructureTemplates.associationReportTypeRole = data;
			});
			getContactTypes((err, data) => {
				if (err) logError(err);
				if (data) this.contactTypes = data;
			});
			getAssociationReportTypeRole((err, data) => {
				if (err) logError(err);
				if (data) this.unfilteredRoleTypes = data;
			});
			getCriteriaStructure('GACOUNTS3', 'FPW_PLANNED_PROGRAM', (err, data) => {
				if (err) logError(err);
				if (data) {
					const critStruct = data;
					critStruct.criteria_USER_ID_eq.push(activeUserID);
					getPlannedPrograms(critStruct, (err, data) => {
						if (err) logError(err);
						if (data) this.plannedPrograms = data;
					});
				}
			});
			getStatePlannedPrograms((err, data) => {
				if (err) logError(err);
				if (data) this.statePlannedPrograms = data;
			});

			const fetchExistingData = () => {
				const fetchSubReportCriteriaStructure = callback => {
					getCriteriaStructure('GACOUNTS3', 'GC3_SUB_REPORT', (err, data) => {
						if (err) logError(err);
						if (data) {
							this.criteriaStructureTemplates.subReport = data;
							callback();
						}
					});
				};
				const fetchSubReport = callback => {
					const critStruct = { ...this.criteriaStructureTemplates.subReport };
					critStruct.criteria_REPORT_ID_eq = this.reportId || url.getParam('duplicateID');
					critStruct.criteria_USER_ID_eq = activeUserID;
					getSubReport(critStruct, (err, data) => {
						if (err) logError(err);
						if (data) {
							const existingSubReport = data[0];
							[
								'ID',
								'USER_ID',
								'ACTUAL_SUBMITTER_ID',
								'REPORT_ID',
								'PLANNED_PROGRAM_ID',
								'STATE_PLANNED_PROGRAM_ID',
								'IS_HIGHLIGHTED',
								'DATE_CREATED',
								'DATE_LAST_UPDATED'
							].forEach(key => {
								if (existingSubReport[key]) this.record[key] = existingSubReport[key];
								if (existingSubReport.PLANNED_PROGRAM_ID) this.issueType = 'local';
								else if (existingSubReport.STATE_PLANNED_PROGRAM_ID) this.issueType = 'state';
							});
							callback();
						}
					});
				};

				const fetchRoles = () => {
					getCriteriaStructure('GACOUNTS3', 'GC3_ASSOCIATION_SUB_REPORT_ROLE', (err, data) => {
						if (err) logError(err);
						if (data) {
							const critStruct = data;
							critStruct.criteria_SUB_REPORT_ID_eq = this.record.ID || -1;
							getAssociationSubReportRole(critStruct, (err, data) => {
								if (err) logError(err);
								if (data) {
									data.forEach(record => {
										delete record.SUB_REPORT_ROLE_LABEL;
									});
									this.roles = data;
								}
							});
						}
					});
				};

				const fetchContacts = () => {
					getCriteriaStructure('GACOUNTS3', 'GC3_SUB_REPORT_CONTACT', (err, data) => {
						if (err) logError(err);
						if (data) {
							const critStruct = data;
							critStruct.criteria_SUB_REPORT_ID_eq = this.record.ID || -1;
							getSubReportContact(critStruct, (err, data) => {
								if (err) logError(err);
								if (data) {
									const contactsMap = this.contacts.map(c => c.TYPE_ID);
									data.forEach(record => {
										const index = contactsMap.indexOf(record.TYPE_ID);
										if (index !== -1) this.contacts[index].QUANTITY = record.QUANTITY;
									});
								}
							});
						}
					});
				};

				const fetchSupplementalData = () => {
					getCriteriaStructure('GACOUNTS3', 'GC3_ASSOCIATION_SUB_REPORT_FIELD', (err, data) => {
						if (err) logError(err);
						if (data) {
							const critStruct = data;
							critStruct.criteria_SUB_REPORT_ID_eq = this.record.ID || -1;
							getAssociationSubReportField(critStruct, (err, data) => {
								if (err) logError(err);
								if (data) {
									const suppDataMap = this.supplementalData.map(d => d.FIELD_ID);
									data.forEach(record => {
										const index = suppDataMap.indexOf(record.FIELD_ID);
										if (index !== -1) this.supplementalData[index].FIELD_VALUE = record.FIELD_VALUE;
									});
								}
							});
						}
					});
				};

				const fetchOutcomes = () => {
					getCriteriaStructure('GACOUNTS3', 'GC3_SUB_REPORT_PURPOSE_ACHIEVEMENTS', (err, data) => {
						if (err) logError(err);
						if (data) {
							const critStruct = data;
							critStruct.criteria_SUB_REPORT_ID_eq = this.record.ID || -1;
							getSubReportPurposeAchievements(critStruct, (err, data) => {
								if (err) logError(err);
								if (data) this.outcomes = data;
							});
						}
					});
				};

				fetchSubReportCriteriaStructure(() => {
					fetchSubReport(() => {
						fetchRoles();
						fetchContacts();
						fetchSupplementalData();
						fetchOutcomes();
					});
				});
			};
			if (this.reportId !== null || typeof url.getParam('duplicateID') === 'string') fetchExistingData();
		},
		methods: {
			getContactLabelFromID (id) {
				const index = this.contactTypes.map(t => t.ID).indexOf(id);
				if (index === -1) return '';

				return this.contactTypes[index].LABEL;
			},
			generateRoleRecord (role) {
				return {
					SUB_REPORT_ID: this.record.ID,
					ROLE_ID: role.ROLE_ID
				};
			},
			populateContactsRecords () {
				if (this.neededReportValues.contacts.length > 0) {
					const contacts = [];
					this.neededReportValues.contacts.forEach(record => {
						const newRecord = { ...record };
						newRecord.QUANTITY = null;
						contacts.push(newRecord);
					});
					this.contacts = contacts;
				} else if (this.contacts.length < 1) {
					getAssociationReportTypeContactType((err, data) => {
						if (err) logError(err);
						if (data) data.forEach(record => {
							if (record.REPORT_TYPE_ID === this.reportType) this.contacts.push({
								REPORT_ID: this.reportId,
								TYPE_ID: record.CONTACT_TYPE_ID,
								QUANTITY: null
							});
						});
					});
				}
			},
			populateOutcomeRecord () {
				this.outcomes.push({
					ID: null,
					REPORT_ID: null,
					USER_ID: null,
					MEMO: null,
					DATE_CREATED: null
				});
			},
			importReportData () {
				this.record = Object.assign(this.record, this.neededReportValues.report);
			}
		}
	};
</script>

<style lang="scss" scoped>
	ul {
		list-style-type: none;
		padding: 0;
		column-count: 2;
		column-width: 7.5rem;
		li {
			break-inside: avoid-column;
		}
	}
</style>
