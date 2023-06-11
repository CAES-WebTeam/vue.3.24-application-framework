<template lang="html">
	<div v-if="!isNewProject && userCanAccessResultsFile && hasBeenApproved">
		<div v-for="column in columns" :key="column.columnName">
			<SmartInput
				v-model="record[column.columnName]"
				:field="column"
				:fetched="false"
				@delete-file="deleteFile(column)"
				@reset-value="record[column.columnName] = null"
			/>
			<!--:fetched="record._fetched"-->
			<div v-if="showUploadButton(column)" class="button-container">
			<!---<div>--->
				<button type="button" class="button" @click="uploadResultsFile()">
					Upload Results File
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	/* global activeUser */
	/* global activeUserId */
	/* global caesCache */
	import alert from '~/modules/applications/caes_research_farm_project/alert';
	import projectSchema from '~/schemas/caes_research_farm_project/project';
	import schema from '~/schemas/caes_research_farm_project/project';
	import SmartInput from '~/views/elements/SmartInput';
	import {
		deepObjectAssign,
		stringFormats, 
		url 
	} from '~/modules/utilities';
	import {
		statusesIndexedByName
	} from '~/modules/applications/caes_research_farm_project/status-handling';
	import { saveResultsFile } from '~/modules/caesdb/caes_research_farm_project';
	import { logError } from '~/modules/caesdb';

	export default {
		name: 'ResultsFile',
		components: { SmartInput },
		props: {
			mode: {
				type: String,
				required: true,
				default: 'view',
				validator (val) {
					return ['edit', 'view'].indexOf(val) !== -1;
				}
			}
		},
		data () {
			return {
				schema: projectSchema,
			};
		},
		computed: {
			columns () {
				return this.schema.columns.filter(column => column.columnName === 'RESULTS_FILE');
			},
			record: {
				get () { return this.$store.state.project; },
				set (val) { this.$store.state.project = val; }
			},
			hasBeenApproved() { return this.$store.state.project.STATUS_ID === statusesIndexedByName.Approved; },
			isNewProject () { return url.getParam('new') !== null || url.getParam('NEW') !== null; },
			userCanAccessResultsFile () {
				if (this.userIsOriginator) return true;
				if (this.userIsPi) return true;
				if (this.userIsAdmin) return true;
				if (this.userIsSuperintendent) return true;
				return false;
			},
			userIsAdmin () { return Boolean(activeUser.IS_ADMINISTRATOR); },
			userIsOriginator () { return this.$store.state.project.ORIGINATOR_ID === activeUserId; },
			userIsPi () { return this.$store.state.project.PI_PERSONNEL_ID === activeUserId; },
			userIsSuperintendent () { return this.$store.state.project.STATION_SUPERINTENDENT_PERSONNEL_ID === activeUserId; }
		},
		methods: {
			deleteFile (column) {
				swal.fire({
					title: 'Are you sure?',
					text: 'This will also delete the file from the server.',
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#6c3129',
					cancelButtonColor: '#004e60',
					confirmButtonText: 'Yes, delete it!'
				}).then(async result => {
					if (result.value) try {
						const response = await column.deleteFile(this.record['ID'], this.record['RESULTS_FILE']);
						if (response.success) this.record['RESULTS_FILE'] = null;
						else alert.failedDelete(this.getPrettyColumnNameFromColumnName(column.columnName), response.messages);
					} catch (err) {
						logError(err);
						alert.failedDelete(this.getPrettyColumnNameFromColumnName(column.columnName), '<p>Server error.  If the problem persists please contact caesweb@uga.edu.</p>');
					}
				});
			},
			getPreparedStoreForSubmit () {
				const schemaLessStore = deepObjectAssign({}, this.$store.state);
				delete schemaLessStore.schema;
				for (const key in schemaLessStore.project) if (schemaLessStore.project[key] === null) schemaLessStore.project[key] = '';
				schema.associations.map(a => stringFormats.camelCase(a.title)).forEach(association => {
					schemaLessStore[association].records.forEach(record => {
						for (const key in record) if (record[key] === null) record[key] = '';
					});
				});

				// Need to re-add files since they get broken during the deep object assign
				schema.columns.filter(c => c.inputType === 'file').forEach(column => {
					schemaLessStore.project[column.columnName] = this.$store.state.project[column.columnName];
				});
				caesCache.data.crfp.status.filter(status => {
					const approvalStatusNames = [
						'Pending Superintendent Approval',
						'Pending Department Head Approval',
						'Pending Final Site Approver Approval',
						'Pending Office of Associate Dean of Research Approval'
					];

					return approvalStatusNames.indexOf(status.NAME) !== -1;
				}).forEach(status => {
					const approvalDateString = `${status.NAME
						.replace(/^Pending (Superintendent|Department Head|Final Site Approver|Office of)(?: Approval| Associate Dean of )(Research)?.*/, '$1 $2')
						.trim()
						.toUpperCase()
						.replace(/ /g, '_')}_APPROVAL_DATE`;
					if (schemaLessStore.project.STATUS_ID === status.ID) {
						const now = new Date();
						schemaLessStore.project[approvalDateString] = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');
					}
				});

				return schemaLessStore;
			},
			async uploadResultsFile () {
				const projectBlob = this.getPreparedStoreForSubmit();

				const response = await saveResultsFile(projectBlob);

				if (response.body.SUCCESS) alert.successfulResultsFileUpload(this.schema.title.toLowerCase(), this.$store.state.project.ID);
				else alert.failedResultsFileUpload(this.schema.title.toLowerCase(), response.body.MESSAGES);
			},
			showUploadButton (column) {
				if (this.record[column.columnName] === null || this.record[column.columnName] === "" || typeof(this.record[column.columnName]) != 'string') {
					return true;
				}
				else {
					return false;
				}
			}
		}
	};
</script>

