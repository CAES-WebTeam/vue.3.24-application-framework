import {
	getMediaProduction,
	getMediaReviewType,
	getMediaType
} from '~/modules/caesdb/gacounts3';
import { enableConstraintValues } from '~/modules/schemaTools';

const schema = {
	title: 'Media Produced',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_MEDIA_PRODUCTION',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getMediaProduction,
	columns: [
		{
			columnName: 'ID',
			prettyName: 'Media Produced',
			type: 'int',
			required: true,
			automated: true
		},
		{
			columnName: 'REPORT_ID',
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
			columnName: 'CITATION',
			prettyName: 'Title/Citation',
			type: 'nvarchar',
			inputType: 'textarea',
			required: true
		},
		{
			columnName: 'REVIEW_TYPE_ID',
			prettyName: 'Review Type',
			type: 'int',
			required: true,
			constraint: {
				getValues: getMediaReviewType,
				foreignKey: 'ID',
				foreignLabel: 'LABEL'
			}
		},
		{
			columnName: 'STATUS_ID',
			type: 'int',
			required: true,
			automated: true,
			default: 3	// Published
		}
	]
};

export default enableConstraintValues(schema);
