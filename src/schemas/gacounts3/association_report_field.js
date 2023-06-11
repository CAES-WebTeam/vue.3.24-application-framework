/* global caesCache */

import { enableConstraintValues } from '~/modules/schemaTools';

const schema = {
	columns: [
		{
			columnName: 'REPORT_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'FIELD_ID',
			prettyName: 'Field',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.gc3.reportField
			}
		},
		{
			columnName: 'FIELD_VALUE',
			prettyName: 'Value',
			type: 'float',
			required: true,
			min: 0
		}
	]
};

export default enableConstraintValues(schema);
