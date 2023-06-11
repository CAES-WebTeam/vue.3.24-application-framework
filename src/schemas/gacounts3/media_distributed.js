import { enableConstraintValues } from '~/modules/schemaTools';
import {
	getMediaDistributed,
	getMediaType
} from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Media Distributed',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_MEDIA_DISTRIBUTED',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getMediaDistributed,
	columns: [
		{
			columnName: 'ID',
			prettyName: 'Media Distributed',
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
			columnName: 'TYPE_ID',
			prettyName: 'Type',
			type: 'int',
			required: true,
			constraint: {
				getValues: getMediaType,
				foreignKey: 'ID',
				foreignLabel: 'LABEL'
			}
		},
		{
			columnName: 'PRODUCTION_ID',
			type: 'int',
			automated: true
		},
		{
			columnName: 'QUANTITY_UNIQUE_WORKS',
			type: 'int',
			required: true,
			default: 0
		},
		{
			columnName: 'CIRCULATION',
			prettyName: 'Direct Engagement',
			type: 'int'
		},
		{
			columnName: 'INDIRECT_CIRCULATION',
			prettyName: 'Circulation',
			type: 'int'
		}
	]
};

export default enableConstraintValues(schema);
