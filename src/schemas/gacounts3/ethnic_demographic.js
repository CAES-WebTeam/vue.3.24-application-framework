/* global caesCache */

import { getEthnicDemographic } from '~/modules/caesdb/gacounts3';
import { enableConstraintValues } from '~/modules/schemaTools';

const schema = {
	title: 'Report Ethnicity Demographics',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_ETHNIC_DEMOGRAPHIC',
	criteria: {
		string: 'criteria_REPORT_ID_eq'
	},
	fetchExisting: getEthnicDemographic,
	columns: [
		{
			columnName: 'REPORT_ID',
			prettyName: 'Report ID',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'ETHNICITY_ID',
			prettyName: 'Ethnicity',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.ccd.ethnicity
			}
		},
		{
			columnName: 'GENDER_ID',
			prettyName: 'Gender',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.ccd.gender
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
