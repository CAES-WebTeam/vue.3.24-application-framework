/* global caesCache */

import { getResidenceDemographic } from '~/modules/caesdb/gacounts3';
import { enableConstraintValues } from '~/modules/schemaTools';

const schema = {
	title: 'Residence Demographics',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_RESIDENCE_DEMOGRAPHIC',
	criteria: {
		string: 'criteria_REPORT_ID_eq'
	},
	fetchExisting: getResidenceDemographic,
	columns: [
		{
			columnName: 'REPORT_ID',
			prettyName: 'Report',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'TYPE_ID',
			prettyName: 'Residence Type',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.gc3.residenceType
			}
		},
		{
			columnName: 'QUANTITY',
			type: 'int',
			required: true,
			min: 0
		}
	]
};

export default enableConstraintValues(schema);
