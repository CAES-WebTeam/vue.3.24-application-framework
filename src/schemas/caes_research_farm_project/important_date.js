import { getImportantDates } from '~/modules/caesdb/caes_research_farm_project';
import { databaseName } from '~/schemas/caes_research_farm_project';

const importantDateSchema = {
	title: 'Important Date',
	databaseName,
	fetchExisting: getImportantDates,
	tablePrefix: 'CRFP_IMPORTANT_DATE',
	criteria: {
		string: 'criteria_SUPPLEMENTAL_ANIMAL_INFO_ID_eq'
	},
	columns: [
		{
			columnName: 'SUPPLEMENTAL_ANIMAL_INFO_ID',
			immutable: true,
			automated: true
		},
		{
			columnName: 'IMPORTANT_DATE',
			prettyName: 'Date',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'DESCRIPTION',
			prettyName: 'Procedure or activity to be performed',
			type: 'nvarchar',
			inputType: 'textarea',
			required: true
		}
	]
};

export default importantDateSchema;
