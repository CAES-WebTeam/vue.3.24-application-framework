import {
	getMediaReview,
	getMediaTypeCategory
} from '~/modules/caesdb/gacounts3';
import { enableConstraintValues } from '~/modules/schemaTools';

const schema = {
	title: 'Media Reviewed',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_MEDIA_REVIEW',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getMediaReview,
	columns: [
		{
			columnName: 'ID',
			prettyName: 'Media Reviewed',
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
			columnName: 'CATEGORY_ID',
			prettyName: 'Category',
			type: 'int',
			constraint: {
				getValues: getMediaTypeCategory,
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
			columnName: 'PUBLICATION_TITLE',
			type: 'nvarchar'
		},
		{
			columnName: 'PUBLICATION_AGENCY',
			type: 'nvarchar'
		},
		{
			columnName: 'PUBLICATION_NUMBER',
			type: 'nvarchar'
		},
		{
			columnName: 'QUANTITY_REVIEWED',
			type: 'int',
			required: true
		}
	]
};

export default enableConstraintValues(schema);
