<template lang="html">
	<div>
		<div class="header">
			<h1>Research Farm Project Outline</h1>
			<!-- Buttons at the top of the page -->
			<div
				:class="`button-container ${mode === 'view' ? 'hide-on-print' : ''}`"
			>
				<!-- Edit Button -->
				<button
					v-if="!isNewProject && userHasEditRights"
					type="button"
					class="edit-view-toggle"
					@click="toggleMode"
				>
					{{ mode === "edit" ? "View" : "Edit" }}
				</button>
				<!-- Duplication Button -->
				<button
					v-if="!isNewProject"
					type="button"
					class="duplication"
					@click="duplicateProject"
				>
					Copy
				</button>
				<!-- Delete Button -->
				<button
					v-if="!isNewProject && userIsAdmin"
					type="button"
					class="delete"
					@click="removeProject"
				>
					Delete
				</button>
			</div>
		</div>
		<DuplicationModal
			v-if="identifier && identifier.duplicate && !duplication.ready"
			:duplication-schema="duplicationSchema"
		/>
		<!-- <p :class="`button-container ${mode === 'view' ? 'hide-on-print' : ''}`">
			<strong>Research Farm Project Outline and Responsibility</strong>
			<br />
			Land requests for spring/summer projects should be made no later than Feb
			15.  Land requests for fall/winter should be made no later than Aug 1.
		</p> -->
		<p :class="`button-container ${mode === 'view' ? 'hide-on-print' : ''}`">
			Please contact Kelly Eisele at (706) 542-2151 or
			<a href="mailto:agresch@uga.edu">agresch@uga.edu</a> with any questions.
		</p>
		<hr />
		<DetailMain
			:schema="schema"
			:mode="mode"
			:identifier="identifier"
			:user-is-owner="userIsOriginator"
			:use-default-submit="false"
		/>
		<hr v-if="mode === 'edit'" />
		<div v-if="mode === 'edit'" class="submit">
			<p>
				By submitting this form, the principal investigator verifies that all
				relevant University Guidelines are being met and project protocols were
				approved by the relevant committees as appropriate (radiological safety,
				biological hazards, animal use).
			</p>

			<div
				v-if="
					!isNewProject &&
						!savedWithoutSubmit &&
						(userIsApprover || userIsAdmin)
				"
				class="button-container"
			>
				<button
					type="button"
					class="button"
					:disabled="isSubmissionPending"
					@click="saveProjectWithoutSubmitting"
				>
					{{ projectIsApproved ? "Save" : "Save Without Status Change" }}
				</button>
				<div v-if="!projectIsApproved">
					<button
						type="button"
						class="approve button"
						:disabled="isSubmissionPending"
						@click="submitProject"
					>
						Approve this Project
					</button>
					<button
						type="button"
						class="button needs-review"
						:disabled="isSubmissionPending"
						@click="submitProjectForReview"
					>
						Project Needs Revision
					</button>
					<button
						type="button"
						class="button reject"
						:disabled="isSubmissionPending"
						@click="rejectProject"
					>
						Reject this Project
					</button>
				</div>
			</div>
			<div
				v-else-if="
					isNewProject ||
						userIsOriginator ||
						(savedWithoutSubmit && userIsAdmin)
				"
				class="button-container"
			>
				<button
					type="button"
					class="button"
					:disabled="isSubmissionPending"
					@click="saveProjectWithoutSubmitting"
				>
					Save Without Submitting
				</button>
				<button
					type="button"
					class="button submit-for-approval"
					:disabled="isSubmissionPending"
					@click="submitProject(true)"
				>
					Submit for Approval
				</button>
			</div>
		</div>
	</div>
</template>

<script>
/* global activeUser */
/* global activeUserId */
/* global caesCache */
/* global swal */
import alert from "~/modules/applications/caes_research_farm_project/alert";
import dateFormat from "dateformat";
import DetailMain from "~/views/DetailMain";
import DuplicationModal from "~/views/DuplicationModal";
import projectDuplicationSchema from "~/schemas/caes_research_farm_project/duplication/project";
import schema from "~/schemas/caes_research_farm_project/project";
import { getSortedSchema } from "~/modules/schemaTools";
import { logError } from "~/modules/caesdb";
import { getComputed, getStore } from "~/modules/store";
import { deepObjectAssign, stringFormats, url } from "~/modules/utilities";
import {
	deleteProject,
	saveProject
} from "~/modules/caesdb/caes_research_farm_project";
import {
	getProjectsNextStatusId,
	getProjectsRevisionStatusId,
	statusesIndexedByName
} from "~/modules/applications/caes_research_farm_project/status-handling";

export default {
	name: "ResearchFarmEntryForm",
	components: {
		DetailMain,
		DuplicationModal
	},
	data() {
		return {
			duplicationSchema: projectDuplicationSchema,
			isSubmissionPending: false,
			mode: "edit",
			schema: getSortedSchema(schema),
			statusesIndexedByName
		};
	},
	computed: {
		approvers() {
			return [
				this.STATION_SUPERINTENDENT_PERSONNEL_ID,
				this.DEPARTMENT_HEAD_PERSONNEL_ID,
				this.FINAL_SITE_APPROVER_PERSONNEL_ID,
				this.OFFICE_OF_RESEARCH_PERSONNEL_ID
			];
		},
		duplicateId() {
			return [
				"duplicateId",
				"duplicateID",
				"DUPLICATEID",
				"duplicateid",
				"DuplicateID",
				"DuplicateId",
				"DuPlIcAtEiD"
			].reduce((duplicateId, param) => {
				if (url.getParam(param) !== null) duplicateId = url.getParam(param);

				return duplicateId;
			}, false);
		},
		duplication() {
			return this.$store.state.duplication;
		},
		...getComputed(schema),
		identifier() {
			const key = "ID";
			const duplicate = this.isDuplicatedProject;
			const value = duplicate
				? this.duplicateId
				: url.getParam("PK_ID") || url.getParam("pk_id");
			if (!value) return false;

			return {
				key,
				duplicate,
				value
			};
		},
		isDuplicatedProject() {
			return this.duplicateId !== null && this.duplicateId !== false;
		},
		isNewProject() {
			return url.getParam("new") !== null || url.getParam("NEW") !== null;
		},
		projectIsApproved() {
			try {
				const {
					data: {
						crfp: { status: statuses }
					}
				} = caesCache;
				const index = statuses
					.map(({ ID }) => ID)
					.indexOf(this.$store.state.project.STATUS_ID);
				const { [index]: currentStatus } = statuses;

				return currentStatus.NAME === "Approved";
			} catch (err) {
				return false;
			}
		},
		projectsNextStatusId() {
			return getProjectsNextStatusId(this.$store.state.project);
		},
		savedWithoutSubmit() {
			if (!this.STATUS_ID) return false;

			// Find the name of the project's current status
			const indexOfStatusId = caesCache.data.crfp.status
				.map(s => s.ID)
				.indexOf(this.STATUS_ID);
			if (indexOfStatusId === -1) return false;
			const currentStatusName =
				caesCache.data.crfp.status[indexOfStatusId].NAME;

			return currentStatusName === "Saved Without Submission";
		},
		userHasEditRights() {
			if (this.userIsOriginator) return true;
			if (this.userIsPi) return true;
			if (Boolean(activeUser.IS_ADMINISTRATOR) === true) return true;
			if (this.userIsCurrentApprover) return true;

			return this.projectIsApproved && this.userIsApprover;
		},
		userIsAdmin() {
			return Boolean(activeUser.IS_ADMINISTRATOR);
		},
		userIsApprover() {
			if (!activeUserId) return false;

			return this.approvers.indexOf(activeUserId) !== -1;
		},
		userIsCurrentApprover() {
			if (!this.STATUS_ID) return false;

			// If they're not the approver, they're not the current one either
			if (!this.userIsApprover) return false;

			// Find the name of the project's current status
			const indexOfStatusId = caesCache.data.crfp.status
				.map(s => s.ID)
				.indexOf(this.STATUS_ID);
			if (indexOfStatusId === -1) return false;
			const currentStatusName =
				caesCache.data.crfp.status[indexOfStatusId].NAME;
			if (!currentStatusName) return false;

			// Filter the columns down to columns containing extra status/personnel data
			const columnsWithExtraStatus = schema.columns.filter(
				c => c.extra && c.extra.status
			);

			// Grab the index of the column for the current pending approver
			const indexOfColumnForPersonnel = columnsWithExtraStatus
				.map(c => c.extra.status)
				.indexOf(currentStatusName);
			if (indexOfColumnForPersonnel === -1) return false;

			// Grab that personnel id string
			const personnelString =
				columnsWithExtraStatus[indexOfColumnForPersonnel].extra.personnelColumn;

			// If it's not there, we're in trouble
			if (!personnelString) return false;

			// Finally, determine whether the current user is that approver
			const isCurrentApprover = this[personnelString] === activeUserId;

			return isCurrentApprover;
		},
		userIsOriginator() {
			return this.ORIGINATOR_ID === activeUserId;
		},
		userIsPi() {
			return this.PI_PERSONNEL_ID === activeUserId;
		},
		userIsCoPi() {
			return this.CO_PI_PERSONNEL_ID === activeUserId;
		}
	},
	mounted() {
		// This function will only ever be run once
		if (this.isNewProject) this.initializeNewProject();
		this.setDocumentTitle();

		// Set mode
		if (url.getParam("pk_id")) this.mode = "view";
	},
	methods: {
		removeProject() {
			swal
				.fire({
					title: "Are you sure?",
					text: "You won't be able to revert this!",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#6c3129",
					cancelButtonColor: "#004e60",
					confirmButtonText: "Yes, delete it!"
				})
				.then(async result => {
					if (result.value)
						try {
							const response = await deleteProject(this.ID);
							if (response.success)
								alert.successfulDelete(this.schema.title.toLowerCase());
							else
								alert.failedDelete(
									this.schema.title.toLowerCase(),
									response.Messages
								);
						} catch (err) {
							logError(err);
							alert.failedDelete(
								this.schema.title.toLowerCase(),
								"<p>Server error.  If the problem persists please contact caesweb@uga.edu.</p>"
							);
						}
				});
		},
		duplicateProject() {
			window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&new&DuplicateId=${this.ID}`;
		},
		initializeNewProject() {
			this.ORIGINATOR_ID = activeUserId;
			this.mode = "edit";
		},
		getPreparedStoreForSubmit() {
			const schemaLessStore = deepObjectAssign({}, this.$store.state);
			delete schemaLessStore.schema;
			for (const key in schemaLessStore.project)
				if (schemaLessStore.project[key] === null)
					schemaLessStore.project[key] = "";
			schema.associations
				.map(a => stringFormats.camelCase(a.title))
				.forEach(association => {
					schemaLessStore[association].records.forEach(record => {
						for (const key in record)
							if (record[key] === null) record[key] = "";
					});
				});

			// Need to re-add files since they get broken during the deep object assign
			schema.columns
				.filter(c => c.inputType === "file")
				.forEach(column => {
					schemaLessStore.project[
						column.columnName
					] = this.$store.state.project[column.columnName];
				});
			caesCache.data.crfp.status
				.filter(status => {
					const approvalStatusNames = [
						"Pending Superintendent Approval",
						"Pending Department Head Approval",
						"Pending Final Site Approver Approval",
						"Pending Office of Associate Dean of Research Approval"
					];

					return approvalStatusNames.indexOf(status.NAME) !== -1;
				})
				.forEach(status => {
					const approvalDateString = `${status.NAME.replace(
						/^Pending (Superintendent|Department Head|Final Site Approver|Office of)(?: Approval| Associate Dean of )(Research)?.*/,
						"$1 $2"
					)
						.trim()
						.toUpperCase()
						.replace(/ /g, "_")}_APPROVAL_DATE`;
					if (schemaLessStore.project.STATUS_ID === status.ID) {
						const now = new Date();
						schemaLessStore.project[approvalDateString] = dateFormat(
							now,
							"yyyy-mm-dd HH:MM:ss"
						);
					}
				});

			return schemaLessStore;
		},
		async rejectProject() {
			this.isSubmissionPending = true;
			const projectBlob = this.getPreparedStoreForSubmit();
			projectBlob.project.STATUS_ID = this.statusesIndexedByName.Rejected;
			let response = await saveProject(projectBlob);
			// response = await response.body;
			response = await response;
			if (response.body === null) {
				response = JSON.parse(response.text);
			} else {
				response = response.body;
			}
			if (response.SUCCESS) {
				alert.successfulReject(
					this.schema.title.toLowerCase(),
					response.PROJECT_ID
				);
			} else {
				alert.failedReject(this.schema.title.toLowerCase(), response.MESSAGES);
				this.isSubmissionPending = false;
			}
		},
		async saveProjectWithoutSubmitting() {
			this.isSubmissionPending = true;
			const projectBlob = this.getPreparedStoreForSubmit();
			if (
				(this.isNewProject ||
					this.userIsOriginator ||
					!projectBlob.project.STATUS_ID) &&
				!this.userIsApprover
			) {
				const indexOfStatus = caesCache.data.crfp.status
					.map(s => s.NAME)
					.indexOf("Saved Without Submission");
				if (indexOfStatus === -1) {
					logError(
						"Unable to save project.  Unable to set status for saving without submission."
					);

					return;
				}
				projectBlob.project.STATUS_ID =
					caesCache.data.crfp.status[indexOfStatus].ID;
			}
			let response = await saveProject(projectBlob, true);
			// response = await response.body;
			response = await response;
			if (response.body === null) {
				response = JSON.parse(response.text);
			} else {
				response = response.body;
			}
			// const parsedResponse = JSON.parse(response.text);
			// console.log(parsedResponse);
			if (response.SUCCESS) {
				if (this.isNewProject)
					alert.successfulSave(
						this.schema.title.toLowerCase(),
						response.PROJECT_ID
					);
				else alert.successfulChanges(response.PROJECT_ID);
			} else {
				alert.failedSave(
					this.schema.title.toLowerCase(),
					response.MESSAGES,
					this.isNewProject
				);
				this.isSubmissionPending = false;
			}
		},
		setDocumentTitle() {
			if (this.isNewProject && this.isDuplicatedProject)
				document.title = `Duplicate Research Farm Project | ${document.title}`;
			else if (this.isNewProject)
				document.title = `New Research Farm Project | ${document.title}`;
			else if (this.mode === "edit")
				document.title = `Research Farm Project | ${document.title}`;
			else document.title = `View Research Farm Project | ${document.title}`;
		},
		async submitProject(isBeingSubmittedForApproval = false) {
			console.log("Hit line 397");
			this.isSubmissionPending = true;
			const projectBlob = this.getPreparedStoreForSubmit();
			if (isBeingSubmittedForApproval)
				projectBlob.project.STATUS_ID = getProjectsNextStatusId(
					this.$store.state.project,
					true
				);
			else projectBlob.project.STATUS_ID = this.projectsNextStatusId;

			let response = await saveProject(projectBlob);
			const submitter = this.userIsOriginator ? "originator" : "approver";
			// response = await response.body;
			response = await response;
			if (response.body === null) {
				response = JSON.parse(response.text);
			} else {
				response = response.body;
			}
			if (response.SUCCESS) {
				alert.successfulSubmit(
					this.schema.title.toLowerCase(),
					submitter,
					response.PROJECT_ID
				);
			} else {
				alert.failedSubmit(
					this.schema.title.toLowerCase(),
					response.MESSAGES,
					this.isNewProject
				);
				this.isSubmissionPending = false;
			}
		},
		async submitProjectForReview() {
			this.isSubmissionPending = true;
			const projectBlob = this.getPreparedStoreForSubmit();
			projectBlob.project.STATUS_ID = getProjectsRevisionStatusId(
				projectBlob.project
			);
			let response = await saveProject(projectBlob);
			// response = await response.body;
			response = await response;
			if (response.body === null) {
				response = JSON.parse(response.text);
			} else {
				response = response.body;
			}
			if (response.SUCCESS) {
				alert.successfulReturnForReview(
					this.schema.title.toLowerCase(),
					response.PROJECT_ID
				);
			} else {
				alert.failedReturnForReview(
					this.schema.title.toLowerCase(),
					response.MESSAGES
				);
				this.isSubmissionPending = false;
			}
		},
		toggleMode() {
			this.mode === "edit" ? (this.mode = "view") : (this.mode = "edit");
		}
	},
	store: getStore(
		schema,
		!url.getParam("key") || (url.getParam("key") && !url.getParam("value"))
	)
};
</script>

<style lang="scss" scoped>
$red: #6c3129;
div.header {
	display: flex;
	justify-content: space-between;
	align-items: stretch;
	h1 {
		align-self: center;
	}
	div.button-container {
		button.delete {
			background: $red;
		}
	}
	@media screen and (max-width: 1080px) {
		display: block;
		h1 {
			margin-bottom: 0.5rem;
		}
		button[type="button"] {
			padding: 0.5rem;
			margin: 0;
		}
	}
}
div.submit {
	div.button-container {
		display: flex;
		justify-content: center;
		button {
			margin-right: 0.5rem;
			&.submit-for-approval,
			&.approve {
				background: #406242;
			}
			&.needs-review {
				background: #f7b538;
				color: #000;
			}
			&.reject,
			&.delete {
				background: $red;
			}
			&:disabled {
				background: #757575;
				cursor: not-allowed;
			}
		}
	}
}
</style>
