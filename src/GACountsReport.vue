<template lang="html">
	<div id="main">
		<div class="heading-container">
			<h1>Activity Report</h1>
			<div class="spacer"></div>
			<button v-if="!isNew && !userIsOwner && userCanFileSubReport" type="button"
				class="file-sub-report hide-on-print" @click="redirectToSubReportEntry">
				{{ userCollaboratorRecord.HAS_REPORTED === 0 ? 'File' : 'Edit' }} Sub-Report
			</button>
			<button v-if="!isNew && userCanFileSubReport && userCollaboratorRecord.HAS_REPORTED === 0" type="button"
				class="hide-on-print reject-sub-report" @click="redirectToSubReportRejection">
				Decline Sub-Report
			</button>
			<button v-if="!isNew" type="button" class="hide-on-print" @click="redirectToDuplication">
				Duplicate
			</button>
			<button v-if="(userIsOwner || userIsAdmin) && !isNew && mode === 'edit'" type="button"
				class="delete hide-on-print" @click="deleteReport">
				Delete
			</button>
			<button v-if="(userIsOwner || userIsAdmin) && !isNew" type="button" class="hide-on-print" @click="toggleMode">
				{{ mode === 'edit' ? 'Print View' : 'Edit View' }}
			</button>
			<button v-if="!isNew && duplicateRecord.hasBeenFetched" type="button"
				:class="`favorite ${duplicateRecord.IS_TEMPLATE ? 'filled-in' : ''} hide-on-print`"
				title="Making a report a favorite will pin it to your GACounts homepage, allowing for easier duplication."
				@click="updateReportTemplateStatus">
				<div v-if="duplicateRecord.IS_TEMPLATE">
					<span class="icon-wrapper">
						★
					</span>
					<span>
						Favorite
					</span>
				</div>
				<div v-else>
					<span class="icon-wrapper">
						☆
					</span>
					<span>
						Make a Favorite
					</span>
				</div>
			</button>
		</div>
		<DuplicationModal v-if="identifier && identifier.duplicate && !duplication.ready"
			:duplication-schema="duplicationSchema">
			<template #custom-content>
				<DuplicationPane4HEnrollment :demographics-selected-for-import="demographicsSelectedForImport" />
			</template>
		</DuplicationModal>
		<DetailMain v-if="isNew || identifier !== null" :schema="schema" :identifier="identifier || false" :mode="mode"
			:user-is-owner="userIsOwner" />
		<div v-else>
			<h2>
				Welcome to the GACounts Single-Page Report Entry
			</h2>
			<p>
				What would you like to do?
			</p>
			<form>
				<label>
					<button type="button" @click="reloadPage">
						Enter a new report
					</button>
				</label>
				<p>
					-- or --
				</p>
				<fieldset>
					<label>
						<span>
							Enter a report ID to lookup an existing report
						</span>
						<input v-model="inputID" type="number" min="0" />
					</label>
					<label>
						<button type="button" @click="reloadPage">
							Go
						</button>
					</label>
				</fieldset>
			</form>
		</div>
		<!-- <pre>{{ schemaLessStore }}</pre> -->
	</div>
</template>

<script>
/* global activeUser */
/* global activeUserID */
/* global notify */
/* global swal */

// Import required modules
import DetailMain from '~/views/DetailMain';
import DuplicationModal from '~/views/DuplicationModal';
import DuplicationPane4HEnrollment from '~/views/custom/gacounts3/DuplicationPane4HEnrollment';
import duplicationSchema from '~/schemas/gacounts3/duplication/report';
import { getSortedSchema } from '~/modules/schemaTools';
import schema from '~/schemas/gacounts3/report';
import {
	getComputed,
	getStore
} from '~/modules/store';
import {
	getCriteriaStructure,
	logError
} from '~/modules/caesdb';
import {
	getDuplicatedReport,
	postReportTemplateStatus
} from '~/modules/caesdb/gacounts3';
import {
	stringFormats,
	url
} from '~/modules/utilities';

// Configure notifications
notify.configure({
	autoHide: {
		log: true
	},
	colors: {
		error: '#eba6a9',
		warn: '#f8fcda',
		log: '#63adf2'
	},
	messageHeadings: {
		log: 'Note:'
	},
	squareCorners: true
});

// Hacky fix for schemas without titles
if (!schema.title) schema.title = stringFormats.tableToTitle(schema.table);

// Sort the schema
const sortedSchema = getSortedSchema(schema);

// Export the actual component
export default {
	name: 'GACountsReport',
	components: {
		DetailMain,
		DuplicationModal,
		DuplicationPane4HEnrollment
	},
	data() {
		// Determine if entering new record
		const isNew = url.getParam('new') !== null;
		const duplicateId = url.getParam('duplicateID') || false;

		// Create our data object to return
		const data = {
			breadCrumbsHaveNotBeenSet: true,
			duplicateRecord: {
				PERSONNEL_ID: activeUserID,
				REPORT_ID: null,
				IS_TEMPLATE: false,
				hasBeenFetched: false
			},
			duplicationSchema,
			identifier: null,
			inputID: null,
			isDuplicate: duplicateId !== false,
			isNew,
			mode: 'view',
			schema: sortedSchema,
			watchedFieldsChangeCount: 0,
			watchedFieldsNotified: []
		};

		// If not entering a new record, we need to get the Report ID
		if (!isNew) {
			const id = url.getParam('PK_ID') || url.getParam('pk_id');
			if (id) data.identifier = {
				key: 'ID',
				value: id,
				duplicate: false
			};
			else logError(new Error('Neither the "new" parameter or a pkid were found when attempting to view an existing report.  This state should not be possible, so it must mean something has really gone wrong.'));
		} else if (duplicateId) {
			data.identifier = {
				key: 'ID',
				value: duplicateId,
				duplicate: true
			};
		}

		// Set the mode to edit if applicable
		if (isNew) data.mode = 'edit';


		return data;
	},
	computed: {
		...getComputed(schema),

		demographicsSelectedForImport() {
			return this.duplicationSchema.sections['Demographic Information'].duplicate;
		},
		duplication() {
			return this.$store.state.duplication;
		},
		schemaLessStore: {
			get() {
				const schemaLessStore = { ...this.$store.state };
				delete schemaLessStore.schema;
				if (schemaLessStore.subschemas) for (const key in schemaLessStore.subschemas) delete schemaLessStore.subschemas[key].schema;

				return schemaLessStore;
			}
		},
		userCanFileSubReport() {
			return this.$store.state.collaborators.records.map(r => r.PERSONNEL_ID).indexOf(activeUserID) !== -1 && !this.userCollaboratorRecord.IS_REJECTED;
		},
		userCollaboratorRecord() {
			const userCollaboratorRecordIndex = this.$store.state.collaborators.records.map(r => r.PERSONNEL_ID).indexOf(activeUserID);
			if (userCollaboratorRecordIndex === -1) return {};
			const userCollaboratorRecord = this.$store.state.collaborators.records[userCollaboratorRecordIndex];

			return userCollaboratorRecord;
		},
		userIsAdmin() {
			return Boolean(activeUser.IS_ADMINISTRATOR);
		},
		userIsOwner() {
			return this.OWNER_ID === activeUserID;
		}
	},

	watch: {
		ID() {
			// Once we have a report ID, we need to check if the user has a
			// duplicated report record for this report
			if (!isNaN(this.ID)) getCriteriaStructure('GACOUNTS3', 'GC3_DUPLICATED_REPORT', (err, data) => {
				if (err) logError(err);
				if (data) {
					const critStruct = data;
					critStruct.criteria_PERSONNEL_ID_eq.push(activeUserID);
					critStruct.criteria_REPORT_ID_eq.push(this.ID);
					getDuplicatedReport(critStruct, (err, data) => {
						if (err) logError(err);
						this.duplicateRecord.REPORT_ID = this.ID;
						if (data.length > 0) this.duplicateRecord.IS_TEMPLATE = data[0].IS_TEMPLATE;
						this.duplicateRecord.hasBeenFetched = true;
					});
				}
			});
		},
		TITLE() {
			if (!this.isNew && this.breadCrumbsHaveNotBeenSet && this.TITLE !== null && this.TITLE !== '') {
				this.setBreadCrumbs();
				this.breadCrumbsHaveNotBeenSet = false;
			}
		}
	},
	mounted() {
		this.watchFields = true;
		if (this.userIsOwner) this.mode = 'edit';
		if (url.getParam('new') !== null) this.OWNER_ID = activeUserID;

		// Set the page title
		if (this.isNew && this.isDuplicate) document.title = `Duplicate Activity Report | ${document.title}`;
		else if (this.isNew) document.title = `New Activity Report | ${document.title}`;
		else document.title = `View Activity Report | ${document.title}`;
	},
	methods: {
		deleteReport() {
			swal({
				title: 'Are you sure?',
				text: 'You won\'t be able to undo this!',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes, delete it!'
			}).then(result => {
				if (result.value) this.schema.deleteExisting(this.identifier.value, (err, data) => {
					if (err) logError(err);
					if (data.SUCCESS) swal(
						'Deleted!',
						`Your ${this.schema.title} has been deleted.`,
						'success'
					).then(() => {
						window.location.assign(`https://${window.location.hostname}/gacounts3`);
					});
					else swal(
						'Oops!',
						`Something went wrong on our end and your ${this.schema.title} could not be deleted.`,
						'error'
					);
				});
			});
		},
		redirectToDuplication() {
			window.location = `https://${window.location.hostname}/gacounts3?referenceInterface=REPORT&subInterface=detail_main&new&duplicateID=${this.ID}`;
		},
		redirectToSubReportEntry() {
			window.location = `https://${window.location.hostname}/gacounts3?function=NewSubReport&REPORT_ID=${this.ID}&PERSONNEL_ID=${activeUserID}`;
		},
		redirectToSubReportRejection() {
			window.location = `https://${window.location.hostname}/gacounts3?function=RefuseSubReportInvitation&REPORT_ID=${this.ID}`;
		},
		reloadPage() {
			if (this.inputID === null) window.location.href = `${window.location.href}&new`;
			else window.location.href = `${window.location.href}&pkid=${this.inputID}`;
		},
		setBreadCrumbs() {
			const breadCrumbList = document.querySelector('ul.breadcrumbs');
			const addListItem = (url, text) => {
				const item = document.createElement('li');
				const link = document.createElement('a');
				link.setAttribute('href', url);
				link.innerHTML = `${text} `;
				item.appendChild(link);
				breadCrumbList.appendChild(item);
			};
			addListItem(`https://${window.location.hostname}/gacounts3/index.cfm?function=reporting_index`, 'Reports');
			addListItem(window.location, this.TITLE);
		},
		toggleMode() {
			if (this.mode === 'edit') this.mode = 'view';
			else if (this.mode === 'view') this.mode = 'edit';
		},
		updateReportTemplateStatus() {
			const duplicateRecord = { ...this.duplicateRecord };
			duplicateRecord.IS_TEMPLATE = !this.duplicateRecord.IS_TEMPLATE;
			postReportTemplateStatus(duplicateRecord, (err, data) => {
				if (err) logError(err);
				if (data.SUCCESS) this.duplicateRecord.IS_TEMPLATE = duplicateRecord.IS_TEMPLATE;
				else notify.error(data.messages);
			});
		}
	},
	store: getStore(schema, !url.getParam('key') || url.getParam('key') && !url.getParam('value'))
};
</script>

<style lang="scss">
button.notify-button {
	color: inherit;
	background: rgba(0, 0, 0, 0.1);
	text-align: left;
	padding: 0.5rem;
	font-size: 1rem;
	margin-bottom: 0;
	margin-top: 1rem;

	&:hover {
		background: rgba(0, 0, 0, 0.2);
	}
}

table tfoot td {
	color: #fff;
	background-color: lighten(#545959, 20%);
	font-weight: 600;
}

td input {
	width: 100%;
}

ul.checkbox {
	list-style-type: none;
	padding: 0;
	column-count: 2;
	column-width: 7.5rem;

	li {
		break-inside: avoid-column;
		page-break-inside: avoid;
		-webkit-column-break-inside: avoid;

		label {
			display: inline-flex;

			span {
				display: flex;
				flex-direction: column;
				justify-content: center;
			}
		}
	}
}

h1,
h2,
h3,
h4,
h5,
h6 {
	&.inline {
		display: inline;
	}
}

.outlined {
	border: 1px solid #000;
	padding: 0.5rem;
}

.margined {
	margin: 0.5rem;
}

button.small {
	font-size: 0.75rem;
	padding: 0.5rem;
}

a.help-link {
	cursor: pointer;

	svg {
		height: 1.125rem;
		vertical-align: sub;
	}
}

table caption a.help-link svg {
	color: #fff;
}

div.modal-container div.modal div.help-message {
	h2 {
		margin-top: 0;
	}

	p.new-window-note {
		display: none;
	}
}

div.heading-container {
	@media screen and (max-width: 1080px) {
		display: block;

		h1 {
			margin-bottom: 0.5rem;
		}

		button[type="button"] {
			padding: 0.5rem;
			margin: 0;

			&.favorite div span.icon-wrapper {
				font-size: 1em;
				line-height: inherit;
			}
		}
	}

	display: flex;
	align-items: stretch;

	h1 {
		align-self: center;
	}

	div.spacer {
		flex-grow: 1;
	}

	button {
		margin-left: 1rem;

		&.file-sub-report {
			background: #406242;
		}

		&.reject-sub-report {
			background: #6c3129;
		}

		&.delete {
			background: #c44536;
		}

		&.favorite {
			&.filled-in {
				background: #f7b538;
				box-shadow: none;
				color: #fff;
			}

			background: transparent;
			box-shadow: inset 0 0 0 0.125rem #f7b538;
			color: #000;
			width: 10rem;

			div {
				display: flex;

				span {
					&:last-of-type {
						flex-grow: 1;
					}

					display: flex;
					flex-direction: column;
					justify-content: center;
					align-items: center;
				}
			}
		}
	}
}

div.inline {
	display: inline-block;
}
</style>
