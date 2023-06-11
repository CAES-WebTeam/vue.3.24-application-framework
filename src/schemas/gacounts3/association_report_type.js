/* global caesCache */

import { getAssociationReportType } from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Report Type Associations',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_ASSOCIATION_REPORT_TYPE',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getAssociationReportType,
	columns: [
		{
			columnName: 'REPORT_ID',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'TITLE',
				values: []
			}
		},
		{
			columnName: 'TYPE_ID',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.gc3.reportType
			}
		}
	]
};

export default schema;
