/* global activeUserID */
/* global actualUserID */

import associationSubReportRoleSchema from '~/schemas/gacounts3/association_sub_report_role';
import {
	getPlannedPrograms,
	getStatePlannedPrograms
} from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Sub-Report',
	prepareForSubmit: subReport => {
		if (subReport.ISSUE_TYPE === 'local' && subReport.STATE_PLANNED_PROGRAM_ID !== null) subReport.STATE_PLANNED_PROGRAM_ID = null;
		if (subReport.ISSUE_TYPE === 'state' && subReport.PLANNED_PROGRAM_ID !== null) subReport.PLANNED_PROGRAM_ID = null;

		return subReport;
	},
	columns: [
		{
			columnName: 'ID',
			prettyName: 'ID',
			type: 'int',
			immutable: true,
			automated: true
		},
		{
			columnName: 'USER_ID',
			prettyName: 'User ID',
			type: 'int',
			immutable: true,
			automated: true,
			default: activeUserID
		},
		{
			columnName: 'ACTUAL_SUBMITTER_ID',
			prettyName: 'Actual Submitter ID',
			type: 'int',
			immutable: true,
			automated: true,
			default: actualUserID
		},
		{
			columnName: 'REPORT_ID',
			prettyName: 'Report ID',
			type: 'int',
			immutable: true,
			automated: true
		},
		{
			columnName: 'ISSUE_TYPE',
			type: 'bit',
			immutable: true,
			automated: true

			// Default: 'local'
		},
		{
			columnName: 'PLANNED_PROGRAM_ID',
			prettyName: 'Local Issue',
			type: 'int',
			constraint: {
				getValues: getPlannedPrograms,
				databaseName: 'FederalPOW',
				tablePrefix: 'FPW_PLANNED_PROGRAM',
				criteria: {
					string: 'criteria_PersonnelMayFileUnder',
					useUserID: true
				},
				database: 'FederalPOW',
				table: 'PLANNED_PROGRAM',
				foreignKey: 'ID',
				foreignLabel: 'NAME',
				identifier: {
					key: 'USER_ID',
					value: 9307
				},
				values: []
			},
			depends: {
				column: 'ISSUE_TYPE',
				test (val) {
					return val === 'LOCAL';
				}
			}
		},
		{
			columnName: 'STATE_PLANNED_PROGRAM_ID',
			prettyName: 'State Issue',
			type: 'int',
			constraint: {
				getValues: getStatePlannedPrograms,
				foreignKey: 'ID',
				foreignLabel: 'NAME',
				values: []
			},
			depends: {
				column: 'ISSUE_TYPE',
				test (val) {
					return val === 'STATE';
				}
			}
		},
		{
			columnName: 'IS_HIGHLIGHTED',
			type: 'bit',
			automated: true,
			default: false
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			type: 'datetime',
			required: true
		}
	],
	associations: [
		{
			title: 'Roles',
			schema: associationSubReportRoleSchema,
			localKey: 'ID',
			foreignKey: 'SUB_REPORT_ID',
			associatedColumn: 'ROLE_ID',
			multiSelect: true
		},
		{
			title: 'Contacts',
			localKey: 'ID',
			foreignKey: 'SUB_REPORT_ID',
			associatedColumn: 'TYPE_ID'
		},
		{
			title: 'Supplemental Data'

			// Schema: {
			// 	prepareForSubmit: (records) => {
			// 		let preparedRecords = [];
			// 		records.forEach((record) => {
			// 			let newRecord = Object.assign({}, record);
			// 			if (newRecord.FIELD_USES_OPTION_LABEL) {
			// 				newRecord.FIELD_OPTION_LABEL = newRecord.VALUE_BOUND_TO_INPUT;
			// 			} else {
			// 				newRecord.FIELD_VALUE = Number(newRecord.VALUE_BOUND_TO_INPUT);
			// 			}
			// 			preparedRecords.push(newRecord);
			// 		});
			// 		return preparedRecords;
			// 	}
			// }
		},
		{
			title: 'Outcome, Impact, and Achievements'
		}
	]
};

export default schema;
