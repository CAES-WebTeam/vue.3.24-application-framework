/* global caesCache */

import { getAssociationReportAttachments } from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Report Attachments',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_ASSOCIATION_REPORT_ATTACHMENTS',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getAssociationReportAttachments,
	columns: [
		{
			columnName: 'REPORT_ID',
			prettyName: 'Report',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'FILE_NAME',
			prettyName: 'File',
			type: 'nvarchar',
			inputType: 'file'
		},
		{
			columnName: 'FILE_LABEL',
			prettyName: 'File Label',
			type: 'nvarchar'
		}
	]
};

export default schema;
