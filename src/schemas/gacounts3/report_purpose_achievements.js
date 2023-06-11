import {
	getReportPurposeAchievements
} from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Outcome, Impact, and Achievements',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_REPORT_PURPOSE_ACHIEVEMENTS',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getReportPurposeAchievements,
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'REPORT_ID',
			prettyName: 'Report',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'USER_ID',
			prettyName: 'User',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'MEMO',
			type: 'nvarchar',
			inputType: 'textarea',
			required: true
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime',
			required: true,
			automated: true
		}
	]
};

export default schema;
