/* global caesCache */

import { enableConstraintValues } from '~/modules/schemaTools';
import { getRacialDemographic } from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Report Racial Demographics',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_RACIAL_DEMOGRAPHIC',
	criteria: {
		string: 'criteria_REPORT_ID_eq'
	},
	fetchExisting: getRacialDemographic,
	columns: [
		{
			columnName: 'REPORT_ID',
			prettyName: 'Report',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'RACE_ID',
			prettyName: 'Race',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.ccd.race
			}
		},
		{
			columnName: 'GENDER_ID',
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
			required: true
		}
	]
};

export default enableConstraintValues(schema);
