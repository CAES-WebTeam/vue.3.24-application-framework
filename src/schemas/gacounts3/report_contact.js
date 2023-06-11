/* global caesCache */

import { enableConstraintValues } from '~/modules/schemaTools';
import { getReportContact } from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Report Contacts',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_REPORT_CONTACT',
	criteria: {
		string: 'criteria_REPORT_ID_eq'
	},
	fetchExisting: getReportContact,
	columns: [
		{
			columnName: 'REPORT_ID',
			prettyName: 'Report',
			type: 'int',
			immutable: true,
			automated: true
		},
		{
			columnName: 'TYPE_ID',
			prettyName: 'Contact Type',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.gc3.contactType
			}
		},
		{
			columnName: 'QUANTITY',
			type: 'int',
			required: true
		}
	]
};

export default enableConstraintValues(schema);
