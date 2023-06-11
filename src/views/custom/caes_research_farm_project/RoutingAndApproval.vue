<template lang="html">
	<div>
		<p>
			The form will be routed electronically to the appropriate department or
			unit head, REC or Farm Superintendent, and finally the individual
			responsible for the REC (usually an assistant or associate dean). The form
			can be returned at any approval level with requested changes. The form
			submitter will be notified by e-mail once the project has been approved.
		</p>
		<!--This is the approvers comment box code it use smartinput bellow-->
		<div v-for="column in columns" :key="column.columnName">
			<div v-show="columnShouldBeDisplayed(column)">
				<div v-if="typeToShow(column) === 'input'">
					<div class="comment-container">
						<SmartInput
							v-model="record[column.columnName]"
							:field="column"
							:fetched="false"
						/>
					</div>
					<!--:fetched="record._fetched"-->
					<div
						v-if="
							mode === 'view' &&
								column.extra &&
								column.extra.needsApprovalButtons
						"
						class="button-container"
					>
						<button
							type="button"
							class="approve"
							@click="
								submitComments(
									column.columnName,
									record[column.columnName],
									'approve'
								)
							"
						>
							Approve this Project
						</button>
						<button
							type="button"
							class="needs-review"
							@click="
								submitComments(
									column.columnName,
									record[column.columnName],
									'returnForReview'
								)
							"
						>
							Project Needs Revision
						</button>
						<button
							type="button"
							class="reject"
							@click="
								submitComments(
									column.columnName,
									record[column.columnName],
									'reject'
								)
							"
						>
							Reject this Project
						</button>
					</div>
				</div>
				<div v-else-if="typeToShow(column) === 'text'">
					<h3>
						{{ column.prettyName || getPrettyColumnName(column.columnName) }}
					</h3>
					<p>
						{{ getDisplayText(column) }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
/* global activeUser */
/* global activeUserId */
/* global caesCache */
import alert from "~/modules/applications/caes_research_farm_project/alert";
import projectSchema from "~/schemas/caes_research_farm_project/project";
import SmartInput from "~/views/elements/SmartInput";
import { getPrettyColumnName } from "~/modules/utilities";
import {
	getProjectsNextStatusId,
	getProjectsRevisionStatusId,
	statusesIndexedByName
} from "~/modules/applications/caes_research_farm_project/status-handling";
import { logError } from "~/modules/caesdb";
import { addComment } from "~/modules/caesdb/caes_research_farm_project";

export default {
	name: "RoutingAndApproval",
	components: { SmartInput },
	props: {
		mode: {
			type: String,
			required: true,
			default: "view",
			validator(val) {
				return ["edit", "view"].indexOf(val) !== -1;
			}
		}
	},
	data() {
		return {
			schema: projectSchema
		};
	},
	computed: {
		columns() {
			return this.schema.columns.filter(
				column =>
					column.grouping.section === "Routing and Approval" &&
					!column.automated
			);
		},
		record: {
			get() {
				return this.$store.state.project;
			},
			set(val) {
				this.$store.state.project = val;
			}
		},
		status() {
			// Grab the index of the project's current status
			const statusIndex = caesCache.data.crfp.status
				.map(s => s.ID)
				.indexOf(this.record.STATUS_ID);

			// If it's not found, assume it's a new project and so no comment
			// sections should be displayed.
			if (statusIndex === -1) return null;

			// Grab the status from the cache
			const status = caesCache.data.crfp.status[statusIndex];

			return status;
		}
	},

	methods: {
		getPrettyColumnName,
		columnShouldBeDisplayed(column) {
			if (this.mode === "view" && column.type === "nvarchar") return true;
			if (
				this.mode === "view" &&
				(typeof this.record[column.columnName] === "undefined" ||
					this.record[column.columnName] === null ||
					this.record[column.columnName] === "")
			)
				return false;
			if (
				this.mode === "edit" &&
				column.type !== "nvarchar" &&
				(typeof this.record[column.columnName] === "undefined" ||
					this.record[column.columnName] === null ||
					this.record[column.columnName] === "")
			)
				return false;
			if (!column.depends) return true;
			if (Array.isArray(column.depends.column))
				return column.depends.test(
					column.depends.column.map(column => this.record[column])
				);

			return column.depends.test(
				this.$store.state.project[column.depends.column]
			);
		},
		getDisplayText(column) {
			if (column.displayModeColumnName) {
				return this.record[column.displayModeColumnName];
			}
			if (!column.constraint) {
				const value = this.record[column.columnName];

				return value === null || value === "" ? "(None)" : value;
			}
			const constraintValueIndex = column.constraint.values
				.map(v => v[column.constraint.foreignKey])
				.indexOf(this.record[column.columnName]);
			if (constraintValueIndex === -1) return "(None)";
			const constraintValue = column.constraint.values[constraintValueIndex];

			return constraintValue[column.constraint.foreignLabel];
		},
		//Updated by Scott 05/17/2023
		async submitComments(columnName, comment, action) {
			if (
				["approve", "returnForReview", "reject", "response"].indexOf(action) ===
				-1
			) {
				logError("Invalid action for comment submission alert.");
				return;
			}

			let status = this.$store.state.project.STATUS_ID;
			if (action === "approve")
				status = getProjectsNextStatusId(this.$store.state.project);
			else if (action === "returnForReview")
				status = getProjectsRevisionStatusId(this.$store.state.project);
			else if (action === "reject") status = statusesIndexedByName.Rejected;
			// No change in status when PI is responding
			else if (action === "response")
				status = this.$store.state.project.STATUS_ID;

			const response = await addComment(
				this.$store.state.project.ID,
				status,
				columnName,
				comment
			);
			if (response.SUCCESS)
				alert.successfulCommentSubmission(
					this.schema.title.toLowerCase(),
					response.PROJECT_ID,
					action
				);
			else
				alert.failedCommentSubmission(
					this.schema.title.toLowerCase(),
					response.MESSAGES
				);
		},

		typeToShow(column) {
			// If it's an ID input, always show the input
			if (column.type === "int") return this.mode === "edit" ? "input" : "text";

			// Else, if it's a comment section, so we have more work to do
			if (column.type === "nvarchar") {
				// If the current user is the approver or an administrator and the
				// project is pending the approver's approval, an input should be
				// shown.
				if (
					(activeUserId === this.record[column.extra.personnelColumn] ||
						activeUser.IS_ADMINISTRATOR) &&
					this.status &&
					this.status.NAME === column.extra.status
				)
					return "input";
				//Modified By Scott 05/17/2023
				// If the current user is the PI and the project is pending their response,
				// an input should be shown.
				if (
					activeUserId === this.record.PI_PERSONNEL_ID &&
					this.status &&
					this.status.NAME === "Awaiting PI Response" // Update this to the correct status
				)
					return "input";

				// If the approval date for this comment section is not null, display
				// the comments as plain text.
				if (this.record[column.extra.dateColumn]) return "text";
			}

			return false;
		}
	}
};
</script>

<style lang="scss" scoped>
div.button-container {
	display: flex;
	button {
		margin-right: 0.5rem;
		&.approve {
			background-color: #406242;
		}
		&.needs-review {
			background: #f7b538;
			color: #000;
		}
		&.reject {
			background-color: #6c3129;
		}
	}
}
</style>
