import {
	getAssociationReport4HEnrollmentActivity
} from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Report 4H Enrollment Activities',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_ASSOCIATION_REPORT_4H_ENROLLMENT_ACTIVITY',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getAssociationReport4HEnrollmentActivity,
	columns: [
		{
			columnName: 'REPORT_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'ACTIVITY_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'ACTIVITY_NAME',
			type: 'varchar',
			required: true
		},
		{
			columnName: 'ACTIVITY_COUNTY_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'ACTIVITY_DATE',
			type: 'datetime',
			required: true
		}
	]
};

export default schema;
