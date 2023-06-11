<template lang="html">
	<div v-if="personnel.length > 0">
		<div>
			<h3>{{ getPersonnelNameFromID(ownerID) }} (Owner)</h3>
			<div
				v-if="mode === 'edit' && (editMode === 'owner' || editMode === 'admin')"
				class="subreport-section"
			>
				<!-- Planned Programs -->
				<div>
					<label>
						<h4>
							Type of Issue
							<a
								class="help-link"
								@click="
									$emit('show-help', { helpMessageName: 'NewReportPlanOfWork' })
								"
							>
								<HelpCircleIcon />
							</a>
						</h4>
						<p>
							Please select a local or state issue type.
						</p>
						<select v-model="ownerSubReport.ISSUE_TYPE">
							<option value="local">
								Local
							</option>
							<option value="state">
								State
							</option>
						</select>
					</label>
					<label v-if="ownerSubReport.ISSUE_TYPE === 'local'">
						<h4>
							Local Issue
						</h4>
						<div v-if="ownerState.plannedPrograms.length > 0">
							<p>
								Please select the local issue to which this sub-report best
								applies.
							</p>
							<select v-model="ownerSubReport.PLANNED_PROGRAM_ID">
								<option
									v-for="program in ownerState.plannedPrograms"
									:key="program.ID"
									:value="program.ID"
								>
									{{ program.NAME }}
								</option>
							</select>
						</div>
						<p v-else>
							<em>
								There are no local issues associated with your account.
							</em>
						</p>
					</label>
					<label v-else-if="ownerSubReport.ISSUE_TYPE === 'state'">
						<h4>
							State Issue
						</h4>
						<p>
							Please select the state issue to which this sub-report best
							applies.
						</p>
						<select
							v-if="statePlannedPrograms.length > 0"
							v-model="ownerSubReport.STATE_PLANNED_PROGRAM_ID"
						>
							<option
								v-for="program in statePlannedPrograms"
								:key="program.ID"
								:value="program.ID"
							>
								{{ program.NAME }}
							</option>
						</select>
					</label>
				</div>
				<!-- Roles -->
				<!--
					We only want to render the list of roles once we have the criteria
					structure needed to filter out role types that don't apply
				-->
				<div v-if="ownerCriteriaStructures.associationReportTypeRole">
					<h4>
						Roles
						<a
							class="help-link"
							@click="$emit('show-help', { helpMessageName: 'ReportRole' })"
						>
							<HelpCircleIcon />
						</a>
					</h4>
					<p>
						Please select the role(s) which best describe your involvement in
						the reported activities.
					</p>
					<ul v-if="reportType !== -1" class="checkbox">
						<li
							v-for="role in ownerRoleTypes"
							:key="role.SUB_REPORT_ROLE_LABEL"
						>
							<label>
								<input
									v-model="ownerRoles"
									type="checkbox"
									:value="generateRoleRecord(role)"
								/>
								<span>
									{{ role.SUB_REPORT_ROLE_LABEL }}
								</span>
							</label>
						</li>
					</ul>
				</div>
				<!-- Contacts -->
				<div v-if="reportAssociatedWithContacts">
					<h4>
						{{
							ownerID === activeUserID
								? "Your"
								: getPersonnelNameFromID(ownerID) + "'s"
						}}
						Contacts
						<a
							class="help-link"
							@click="
								$emit('show-help', { helpMessageName: 'CONTACTS_HEADER' })
							"
						>
							<HelpCircleIcon />
						</a>
					</h4>
					<p>
						Use this section to enter only those contacts you personally made.
					</p>
					<table>
						<thead>
							<tr>
								<th>
									Contact Type
								</th>
								<th>
									Your Quantity
								</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="contact in ownerContacts" :key="contact.TYPE_ID">
								<td>
									{{ getContactLabelFromID(contact.TYPE_ID) }}
								</td>
								<td>
									<input
										v-model.number="contact.QUANTITY"
										type="number"
										min="0"
									/>
									<em
										>Quantity Entered Above:
										{{ getMainReportContactQuantity(contact.TYPE_ID) }}</em
									>
								</td>
							</tr>
						</tbody>
						<tfoot>
							<tr>
								<td>
									Total
								</td>
								<td>
									{{ sum(ownerContacts, "QUANTITY") }}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
				<!-- Supplemental Data -->
				<!--
					If working with an existing report/subreport, we only want to render
					supplemental data once we've loaded the subreport, as the subreport's
					id will be used to fetch existing supplemental data records.
				-->
				<SupplementalData
					v-if="!needExistingData || ownerSubReport.ID !== null"
					:for-sub-report="true"
					:mode="mode"
					@show-help="
						$emit('show-help', { helpMessageName: 'ReportSupplementalData' })
					"
				/>
				<!-- Outcome, Impact, Achievements -->
				<div>
					<label>
						<h4>
							Outcome, Impact, and Achievements
						</h4>
						<div v-for="outcome in ownerOutcomes" :key="outcome.ID">
							<textarea v-model="outcome.MEMO"></textarea>
						</div>
					</label>
				</div>
			</div>
			<div v-else class="subreport-section">
				<SubReportPlainText
					:data="getOwnerSubReportData()"
					:role-types="ownerRoleTypes"
				/>
			</div>
		</div>
		<transition-group appear name="fade">
			<div
				v-for="collaborator in collaboratorsWithoutOwner"
				:key="collaborator.PERSONNEL_ID"
			>
				<h3>
					{{
						collaborator.DISPLAY_NAME ||
							getPersonnelNameFromID(collaborator.PERSONNEL_ID)
					}}
					<button
						v-if="
							!needExistingData ||
								(needExistingData &&
									mode === 'edit' &&
									(editMode === 'owner' || editMode === 'admin') &&
									(!collaborator.HAS_REPORTED ||
										collaborator.HAS_REPORTED !== 1))
						"
						type="button"
						class="button small"
						@click="removeCollaborator(collaborator)"
					>
						Remove
					</button>
				</h3>
				<div class="subreport-section">
					<p
						v-if="
							!isNew &&
								((editMode === 'collaborator' &&
									activeUserID === collaborator.PERSONNEL_ID) ||
									editMode === 'admin')
						"
					>
						<a
							:href="
								'https://' +
									hostname +
									'/gacounts3/index.cfm?function=NewSubReport&REPORT_ID=' +
									reportID +
									'&PERSONNEL_ID=' +
									collaborator.PERSONNEL_ID
							"
						>
							{{
								collaborator.HAS_REPORTED ? "Edit/Delete" : "File Sub-Report"
							}}
						</a>
					</p>
					<p v-else-if="editMode === 'owner' && collaborator.HAS_REPORTED">
						<a
							:href="
								'https://' +
									hostname +
									'/gacounts3/index.cfm?function=NewSubReport&REPORT_ID=' +
									reportID +
									'&PERSONNEL_ID=' +
									collaborator.PERSONNEL_ID
							"
						>
							Delete
						</a>
					</p>
					<p
						v-if="
							!needExistingData ||
								!collaborator.HAS_REPORTED ||
								collaborator.HAS_REPORTED !== 1
						"
					>
						<em>
							No sub-report filed.
						</em>
					</p>
					<SubReportPlainText
						v-else
						:data="
							getCollaboratorSubReportDataFromID(collaborator.PERSONNEL_ID)
						"
					/>
				</div>
			</div>
		</transition-group>
		<div
			v-if="mode === 'edit' && (editMode === 'owner' || editMode === 'admin')"
		>
			<h3>
				Add Collaborator
			</h3>
			<p>
				Begin entering the name of the person you'd like to add, then simply
				select their name from the list to add them to your report as a
				collaborator.
			</p>
			<FuzzySelect
				v-model="newCollaborator.PERSONNEL_ID"
				:options="personnelForFuzzySelect"
				@addCollaborator="addCollaborator"
			/>
		</div>
	</div>
</template>

<script>
/* global activeUser */
/* global activeUserID */
/* global caesCache */
import FuzzySelect from "~/views/elements/FuzzySelect";
import HelpCircleIcon from "vue-feather-icons/icons/HelpCircleIcon";
import SubReportPlainText from "~/views/custom/gacounts3/SubReportPlainText";
import SupplementalData from "~/views/custom/gacounts3/SupplementalData";
import { singleItem } from "@gabegabegabe/utils/dist/array/reducers";
import { getCriteriaStructure, logError } from "~/modules/caesdb";
import {
	getAssociationReportTypeContactType,
	getAssociationReportTypeRole,
	getAssociationSubReportField,
	getAssociationSubReportRole,
	getContactTypes,
	getPersonnel,
	getPersonnelWithCriteria,
	getPlannedPrograms,
	getReportPersonnel,
	getStatePlannedPrograms,
	getSubReport,
	getSubReportContact,
	getSubReportPurposeAchievements
} from "~/modules/caesdb/gacounts3";
import { cfToJs, filter } from "~/modules/criteriaUtils";
import { modeValidator, url } from "~/modules/utilities";

export default {
	name: "SubReportCollaborators",
	components: {
		FuzzySelect,
		HelpCircleIcon,
		SubReportPlainText,
		SupplementalData
	},
	props: {
		mode: {
			type: String,
			default: "view",
			validator: modeValidator
		}
	},
	data() {
		// Determine if entering new record
		const isNew = url.getParam("new") !== null;
		const data = {
			activeUserID,
			collaboratorRecords: {
				contacts: [],
				outcomes: [],
				plannedPrograms: [],
				roles: [],
				subReports: [],
				supplementalData: []
			},
			contactTypes: [],
			criteriaStructureTemplates: {
				associationReportTypeContactType: cfToJs(
					caesCache.criteriaStructures.gc3.associationReportTypeContactType
				),
				associationReportTypeRole: cfToJs(
					caesCache.criteriaStructures.gc3.associationReportTypeRole
				),
				plannedProgram: cfToJs(caesCache.criteriaStructures.fpw.plannedProgram),
				subReport: cfToJs(caesCache.criteriaStructures.gc3.subReport)
			},
			hostname: window.location.hostname,
			isNew,
			newCollaborator: {
				REPORT_ID: this.reportID || null,
				PERSONNEL_ID: null,
				IS_REJECTED: false
			},
			ownerState: {
				contacts: [],
				plannedPrograms: [],
				supplementalData: [],
				unfilteredRoleTypes: []
			},
			personnel: [],
			retiredPersonnel: [],
			statePlannedPrograms: []
		};

		return data;
	},
	computed: {
		allSubReportIDs() {
			const subReportIDs = [];
			this.collaboratorRecords.subReports
				.map(r => r.ID)
				.forEach(id => {
					if (id !== null) subReportIDs.push(id);
				});
			if (this.ownerSubReport.ID !== null)
				subReportIDs.push(this.ownerSubReport.ID);

			return subReportIDs;
		},
		collaborators: {
			get() {
				return this.$store.state.collaborators.records;
			},
			set(val) {
				this.$store.state.collaborators.records = val;
			}
		},
		collaboratorsWithoutOwner() {
			return this.collaborators.filter(c => c.PERSONNEL_ID !== this.ownerID);
		},
		duplication() {
			const duplication = {
				getCollaborators: false,
				getSubReport: false
			};
			if (
				this.$store.state.duplication.associations &&
				this.$store.state.duplication.associations.collaborators
			)
				duplication.getCollaborators = true;
			if (
				this.$store.state.duplication.subschemas &&
				this.$store.state.duplication.subschemas.subReport
			)
				duplication.getSubReport = true;

			return duplication;
		},
		editMode() {
			if (activeUser.IS_ADMINISTRATOR) return "admin";
			if (activeUserID === this.ownerID) return "owner";
			if (
				this.collaborators.map(c => c.PERSONNEL_ID).indexOf(activeUserID) !== -1
			)
				return "collaborator";

			return "guest";
		},
		fetched: {
			get() {
				return this.$store.state.subschemas.subReport.fetched;
			},
			set(val) {
				this.$store.state.subschemas.subReport.fetched = val;
				for (const key in this.$store.state.subschemas.subReport)
					if (key !== "subReport" && key !== "fetched")
						this.$store.state.subschemas.subReport[key].fetched = val;
			}
		},
		needExistingData() {
			return this.reportID !== null;
		},
		ownerContacts: {
			get() {
				return this.$store.state.subschemas.subReport.contacts.records;
			},
			set(val) {
				this.$store.state.subschemas.subReport.contacts.records = val;
			}
		},
		ownerCriteriaStructures() {
			const critStructs = {};
			if (this.criteriaStructureTemplates.associationReportTypeContactType) {
				critStructs.associationReportTypeContactType = {
					...this.criteriaStructureTemplates.associationReportTypeContactType
				};
				critStructs.associationReportTypeContactType.criteria_REPORT_TYPE_ID_eq = [
					this.reportType
				];
			}
			if (this.criteriaStructureTemplates.associationReportTypeRole) {
				critStructs.associationReportTypeRole = {
					...this.criteriaStructureTemplates.associationReportTypeRole
				};
				critStructs.associationReportTypeRole.criteria_TYPE_ID_eq = [
					this.reportType
				];
			}

			return critStructs;
		},
		ownerID() {
			return this.$store.state.report.OWNER_ID || activeUserID;
		},
		ownerOutcomes: {
			get() {
				return this.$store.state.subschemas.subReport
					.outcomeImpactAndAchievements.records;
			},
			set(val) {
				this.$store.state.subschemas.subReport.outcomeImpactAndAchievements.records = val;
			}
		},
		ownerRoles: {
			get() {
				return this.$store.state.subschemas.subReport.roles.records;
			},
			set(val) {
				this.$store.state.subschemas.subReport.roles.records = val;
			}
		},
		ownerRoleTypes() {
			return filter(
				this.ownerState.unfilteredRoleTypes,
				this.ownerCriteriaStructures.associationReportTypeRole
			);
		},
		ownerSubReport: {
			get() {
				return this.$store.state.subschemas.subReport.subReport;
			},
			set(val) {
				this.$store.state.subschemas.subReport.subReport = val;
			}
		},
		ownerSupplementalData: {
			get() {
				return this.$store.state.subschemas.subReport.supplementalData.records;
			},
			set(val) {
				this.$store.state.subschemas.subReport.supplementalData.records = val;
			}
		},
		personnelForFuzzySelect() {
			return this.personnel.map(personnel => ({
				key: personnel.PERSONNEL_ID,
				label: [
					personnel.FIRST_NAME,
					personnel.MIDDLE_NAME,
					personnel.LAST_NAME
				].join(" ")
			}));
		},
		reportAssociatedWithContacts() {
			return (
				caesCache.data.gc3.associationReportTypeContactType
					.map(assn => assn.REPORT_TYPE_ID)
					.indexOf(this.reportType) !== -1
			);
		},
		reportContacts() {
			return this.$store.state.contacts.records;
		},
		reportID() {
			return this.$store.state.report.ID;
		},
		reportType() {
			const reportTypeRecords = this.$store.state.reportType.records;

			return reportTypeRecords.length > 0 ? reportTypeRecords[0].TYPE_ID : -1;
		}
	},
	watch: {
		collaborators() {
			this.fetchMissingPersonnel();
		},
		reportContacts() {
			this.populateOwnerContactsRecords();
		}
	},
	mounted() {
		const fetchPlannedPrograms = () => {
			const critStruct = { ...this.criteriaStructureTemplates.plannedProgram };
			this.collaboratorRecords.subReports.forEach(subReport => {
				if (
					subReport.PLANNED_PROGRAM_ID &&
					critStruct.criteria_ID_eq.indexOf(subReport.PLANNED_PROGRAM_ID) === -1
				)
					critStruct.criteria_ID_eq.push(subReport.PLANNED_PROGRAM_ID);
			});
			if (this.ownerSubReport.PLANNED_PROGRAM_ID)
				critStruct.criteria_ID_eq.push(this.ownerSubReport.PLANNED_PROGRAM_ID);
			if (critStruct.criteria_ID_eq.length > 0)
				getPlannedPrograms(critStruct, (err, data) => {
					if (err) logError(err);
					if (data)
						data.forEach(record => {
							if (record.ID === this.ownerSubReport.PLANNED_PROGRAM_ID)
								this.ownerState.plannedPrograms.push(record);
							else if (this.needExistingData)
								this.collaboratorRecords.plannedPrograms.push(record);
						});
				});
		};

		const fetchCollaborators = () => {
			const critStruct = caesCache.criteriaStructures.gc3.reportPersonnel;
			critStruct.criteria_REPORT_ID_eq = [
				this.reportID || url.getParam("duplicateID")
			];
			if (critStruct.criteria_REPORT_ID_eq.length > 0)
				getReportPersonnel(critStruct, (err, data) => {
					if (err) logError(err);
					if (data) this.collaborators = data;
				});
		};

		const fetchSupplementalData = () => {
			const critStruct =
				caesCache.criteriaStructures.gc3.associationSubReportField;
			critStruct.criteria_SUB_REPORT_ID_eq = this.allSubReportIDs;
			if (critStruct.criteria_SUB_REPORT_ID_eq.length > 0)
				getAssociationSubReportField(critStruct, (err, data) => {
					if (err) logError(err);
					if (data)
						data.forEach(record => {
							if (record.SUB_REPORT_ID === this.ownerSubReport.ID)
								this.ownerState.supplementalData.push(record);
							else if (this.needExistingData)
								this.collaboratorRecords.supplementalData.push(record);
						});
				});
		};

		const fetchContacts = () => {
			const critStruct = caesCache.criteriaStructures.gc3.subReportContact;
			critStruct.criteria_SUB_REPORT_ID_eq = this.allSubReportIDs;
			if (critStruct.criteria_SUB_REPORT_ID_eq.length > 0)
				getSubReportContact(critStruct, (err, data) => {
					if (err) logError(err);
					if (data) {
						const ownerContactsMap = this.ownerContacts.map(c => c.TYPE_ID);
						data.forEach(record => {
							if (record.SUB_REPORT_ID === this.ownerSubReport.ID) {
								const index = ownerContactsMap.indexOf(record.TYPE_ID);
								if (index !== -1)
									this.ownerContacts[index].QUANTITY = record.QUANTITY;
								else this.ownerState.contacts.push(record);
							} else if (this.needExistingData) {
								this.collaboratorRecords.contacts.push(record);
							}
						});
					}
				});
		};

		const fetchContactTypes = () => {
			getContactTypes((err, data) => {
				if (err) logError(err);
				if (data) this.contactTypes = data;
			});
		};

		const fetchOutcomes = () => {
			getCriteriaStructure(
				"GACOUNTS3",
				"GC3_SUB_REPORT_PURPOSE_ACHIEVEMENTS",
				(err, data) => {
					if (err) logError(err);
					if (data) {
						const critStruct = data;
						critStruct.criteria_SUB_REPORT_ID_eq = this.allSubReportIDs;
						if (critStruct.criteria_SUB_REPORT_ID_eq.length > 0)
							getSubReportPurposeAchievements(critStruct, (err, data) => {
								if (err) logError(err);
								if (data)
									data.forEach(record => {
										if (record.SUB_REPORT_ID === this.ownerSubReport.ID) {
											if (this.duplication.getSubReport) {
												record.ID = null;
												record.SUB_REPORT_ID = null;
												record.REPORT_ID = null;
											}
											this.ownerOutcomes = [record];
										} else if (this.needExistingData) {
											if (this.duplication.getSubReport) {
												record.ID = null;
												record.SUB_REPORT_ID = null;
												record.REPORT_ID = null;
											}
											this.collaboratorRecords.outcomes.push(record);
										}
									});
							});
					}
				}
			);
		};

		const fetchPersonnel = () => {
			getPersonnel((err, data) => {
				if (err) logError(err);
				if (data) {
					this.personnel = data;
					this.fetchMissingPersonnel();
				}
			});
		};

		const fetchOwnerPlannedPrograms = () => {
			const critStruct = { ...this.criteriaStructureTemplates.plannedProgram };
			critStruct.criteria_PersonnelMayFileUnder = activeUserID;
			getPlannedPrograms(critStruct, (err, data) => {
				if (err) logError(err);
				if (data) this.ownerState.plannedPrograms = data;
			});
		};

		const fetchRoles = () => {
			const critStruct =
				caesCache.criteriaStructures.gc3.associationSubReportRole;
			critStruct.criteria_SUB_REPORT_ID_eq = this.allSubReportIDs;
			if (critStruct.criteria_SUB_REPORT_ID_eq.length > 0)
				getAssociationSubReportRole(critStruct, (err, data) => {
					if (err) logError(err);
					if (data)
						data.forEach(record => {
							if (record.SUB_REPORT_ID === this.ownerSubReport.ID) {
								if (this.editMode === "owner" || this.editMode === "admin")
									delete record.SUB_REPORT_ROLE_LABEL;
								this.ownerRoles.push(record);
							} else if (this.needExistingData) {
								this.collaboratorRecords.roles.push(record);
							}
						});
				});
		};

		const fetchRoleTypes = () => {
			getAssociationReportTypeRole((err, data) => {
				if (err) logError(err);
				if (data) this.ownerState.unfilteredRoleTypes = data;
			});
		};

		const fetchStatePlannedPrograms = () => {
			getStatePlannedPrograms((err, data) => {
				if (err) logError(err);
				if (data) this.statePlannedPrograms = data;
			});
		};

		const fetchSubReports = callback => {
			const critStruct = { ...this.criteriaStructureTemplates.subReport };
			critStruct.criteria_REPORT_ID_eq = [
				this.reportID || url.getParam("duplicateID")
			];
			getSubReport(critStruct, (err, data) => {
				if (err) logError(err);
				if (data) {
					data.forEach(record => {
						const subReport = { ISSUE_TYPE: null };
						[
							"ID",
							"USER_ID",
							"ACTUAL_SUBMITTER_ID",
							"REPORT_ID",
							"PLANNED_PROGRAM_ID",
							"STATE_PLANNED_PROGRAM_ID",
							"IS_HIGHLIGHTED",
							"DATE_CREATED",
							"DATE_LAST_UPDATED"
						].forEach(key => {
							if (record[key]) subReport[key] = record[key];
						});
						if (subReport.USER_ID === this.ownerID) {
							subReport.ISSUE_TYPE = subReport.PLANNED_PROGRAM_ID
								? "local"
								: "state";
							this.ownerSubReport = subReport;
						} else if (this.needExistingData) {
							this.collaboratorRecords.subReports.push(subReport);
						}
					});
					callback();
				}
			});
		};

		const fetchExistingData = () => {
			fetchCollaborators();
			fetchSubReports(() => {
				fetchContacts();
				fetchPlannedPrograms();
				fetchSupplementalData();
				fetchOutcomes();
				fetchRoles();
			});
			this.fetched = true;
		};

		fetchPersonnel();
		fetchStatePlannedPrograms();

		if (this.editMode === "owner" || this.editMode === "admin") {
			fetchOwnerPlannedPrograms();
			fetchRoleTypes();
			fetchContactTypes();
			this.populateOwnerContactsRecords();
			this.populateOwnerOutcomeRecord();
		}
		if (this.needExistingData && !this.fetched) {
			fetchExistingData();
		} else if (
			this.duplication.getCollaborators ||
			this.duplication.getSubReport
		) {
			if (this.duplication.getCollaborators) fetchCollaborators();
			if (this.duplication.getSubReport)
				fetchSubReports(() => {
					fetchContacts();
					fetchSupplementalData();
					fetchOutcomes();
					fetchRoles();
				});
		}
	},
	/* methods: {
			addCollaborator () {
				if (this.newCollaborator.PERSONNEL_ID) {
					this.collaborators.push({ ...this.newCollaborator });
					this.newCollaborator = {
						REPORT_ID: this.reportID || null,
						PERSONNEL_ID: null,
						IS_REJECTED: false
					};
				}
			}, */
	methods: {
		// Modified by SA on 04/24/23 Added check to prevent adding the same collaborator multiple times
		addCollaborator() {
			if (this.newCollaborator.PERSONNEL_ID) {
				// Check if the collaborator already exists in the collaborators array
				const collaboratorExists = this.collaborators.some(
					existingCollaborator =>
						existingCollaborator.PERSONNEL_ID ===
						this.newCollaborator.PERSONNEL_ID
				);

				// If the collaborator already exists, do not add them again
				if (collaboratorExists) {
					return;
				}

				// Else, add the collaborator to the collaborators array
				this.collaborators.push({ ...this.newCollaborator });
				this.newCollaborator = {
					REPORT_ID: this.reportID || null,
					PERSONNEL_ID: null,
					IS_REJECTED: false
				};
			}
		},
		removeCollaborator(collaborator) {
			this.collaborators.splice(this.collaborators.indexOf(collaborator), 1);
		},
		fetchMissingPersonnel() {
			const critStruct = cfToJs(caesCache.criteriaStructures.ccd.personnel);
			critStruct.criteria_PERSONNEL_ID_eq = this.collaborators.map(
				c => c.PERSONNEL_ID
			);
			if (this.personnel.map(p => p.PERSONNEL_ID).indexOf(this.ownerID) === -1)
				critStruct.criteria_PERSONNEL_ID_eq.push(this.ownerID);
			if (critStruct.criteria_PERSONNEL_ID_eq.length > 0)
				getPersonnelWithCriteria(critStruct, (err, records) => {
					if (err) console.error(err);
					this.retiredPersonnel = records;
				});
		},
		getCollaboratorPlannedProgramFromID(id) {
			const collabProgramsMap = this.collaboratorRecords.plannedPrograms.map(
				p => p.ID
			);
			const index = collabProgramsMap.indexOf(id);
			if (index === -1) return {};

			return this.collaboratorRecords.plannedPrograms[index];
		},
		getCollaboratorSubReportDataFromID(id) {
			const data = {
				contacts: [],
				outcomes: [],
				roles: [],
				subReport: {},
				supplementalData: []
			};
			this.collaboratorRecords.subReports.forEach(subReport => {
				if (subReport.USER_ID === id) data.subReport = subReport;
			});
			this.collaboratorRecords.contacts.forEach(contact => {
				if (contact.SUB_REPORT_ID === data.subReport.ID)
					data.contacts.push(contact);
			});
			this.collaboratorRecords.outcomes.forEach(outcome => {
				if (outcome.USER_ID === id) data.outcomes.push(outcome);
			});
			this.collaboratorRecords.roles.forEach(role => {
				if (role.SUB_REPORT_ID === data.subReport.ID) data.roles.push(role);
			});
			this.collaboratorRecords.supplementalData.forEach(record => {
				if (record.SUB_REPORT_ID === data.subReport.ID)
					data.supplementalData.push(record);
			});
			if (data.subReport.STATE_PLANNED_PROGRAM_ID)
				data.subReport.statePlannedProgram = this.getStatePlannedProgramFromID(
					data.subReport.STATE_PLANNED_PROGRAM_ID
				);
			if (data.subReport.PLANNED_PROGRAM_ID)
				data.subReport.plannedProgram = this.getCollaboratorPlannedProgramFromID(
					data.subReport.PLANNED_PROGRAM_ID
				);

			return data;
		},
		getContactLabelFromID(id) {
			const index = this.contactTypes.map(t => t.ID).indexOf(id);
			if (index === -1) return "";

			return this.contactTypes[index].LABEL;
		},
		getMainReportContactQuantity(typeId) {
			const filteredContacts = this.$store.state.contacts.records.filter(
				({ TYPE_ID }) => TYPE_ID === typeId
			);
			if (filteredContacts.length > 0)
				return filteredContacts.reduce(singleItem).QUANTITY;

			return 0;
		},
		getOwnerPlannedProgramFromID(id) {
			let plannedProgram = {};
			this.ownerState.plannedPrograms.forEach(program => {
				if (program.ID === id) plannedProgram = program;
			});

			return plannedProgram;
		},
		getOwnerSubReportData() {
			const data = {
				contacts: this.ownerContacts,
				outcomes: this.ownerOutcomes,
				roles: this.ownerRoles,
				subReport: this.ownerSubReport,
				supplementalData: this.ownerState.supplementalData
			};
			data.contacts.forEach(contact => {
				this.contactTypes.forEach(type => {
					if (type.ID === contact.TYPE_ID)
						contact.CONTACT_TYPE_LABEL = type.LABEL;
				});
			});
			if (data.subReport.STATE_PLANNED_PROGRAM_ID)
				data.subReport.statePlannedProgram = this.getStatePlannedProgramFromID(
					data.subReport.STATE_PLANNED_PROGRAM_ID
				);
			if (data.subReport.PLANNED_PROGRAM_ID)
				data.subReport.plannedProgram = this.getOwnerPlannedProgramFromID(
					data.subReport.PLANNED_PROGRAM_ID
				);

			return data;
		},
		getPersonnelNameFromID(id) {
			let index = this.personnel.map(p => p.PERSONNEL_ID).indexOf(id);
			if (index === -1) {
				index = this.retiredPersonnel.map(p => p.PERSONNEL_ID).indexOf(id);
				if (index === -1) return "Unknown";

				return this.retiredPersonnel[index].DISPLAY_NAME;
			}
			const personnel = this.personnel[index];

			return personnel.DISPLAY_NAME;
		},
		getStatePlannedProgramFromID(id) {
			let statePlannedProgram = {};
			this.statePlannedPrograms.forEach(program => {
				if (program.ID === id) statePlannedProgram = program;
			});

			return statePlannedProgram;
		},
		generateRoleRecord(role) {
			return {
				SUB_REPORT_ID: this.ownerSubReport.ID || null,
				ROLE_ID: role.ROLE_ID
			};
		},
		populateOwnerContactsRecords() {
			getAssociationReportTypeContactType((err, data) => {
				if (err) logError(err);
				if (data)
					data.forEach(record => {
						if (record.REPORT_TYPE_ID === this.reportType)
							if (
								this.ownerContacts
									.map(c => c.TYPE_ID)
									.indexOf(record.CONTACT_TYPE_ID) === -1
							) {
								this.ownerContacts.push({
									SUB_REPORT_ID: this.ownerSubReport.ID || null,
									TYPE_ID: record.CONTACT_TYPE_ID,
									QUANTITY: null
								});
							}
					});
			});
		},
		populateOwnerOutcomeRecord() {
			if (this.ownerOutcomes.length < 1)
				this.ownerOutcomes = [
					{
						ID: null,
						REPORT_ID: null,
						USER_ID: null,
						MEMO: null,
						DATE_CREATED: null
					}
				];
		},
		sum(objArr, key) {
			let sum = 0;
			objArr.forEach(obj => {
				sum += Number(obj[key]);
			});

			return sum;
		}
	}
};
</script>

<style lang="scss" scoped>
textarea {
	width: 100%;
}
div.subreport-section {
	padding: 0 1rem;
}
</style>
