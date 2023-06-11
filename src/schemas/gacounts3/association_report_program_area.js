/* global caesCache */

import { getAssociationReportProgramArea } from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Report Program Areas',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_ASSOCIATION_REPORT_PROGRAM_AREA',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getAssociationReportProgramArea,
	columns: [
		{
			columnName: 'REPORT_ID',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'AREA_ID',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.ccd.programArea
			}
		}
	]
};

export default schema;
