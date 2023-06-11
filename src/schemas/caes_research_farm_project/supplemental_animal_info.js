import importantDateSchema from '~/schemas/caes_research_farm_project/important_date';
import { databaseName } from '~/schemas/caes_research_farm_project';
import { getSupplementalAnimalInfo } from '~/modules/caesdb/caes_research_farm_project';

const supplementalAnimalInfoSchema = {
	title: 'Supplemental Animal Information',
	databaseName,
	tablePrefix: 'CRFP_SUPPLEMENTAL_ANIMAL_INFO',
	criteria: {
		string: 'criteria_PROJECT_ID_eq'
	},
	fetchExisting: getSupplementalAnimalInfo,
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			automated: true
		},
		{
			columnName: 'PROJECT_ID',
			type: 'int',
			immutable: true,
			automated: true
		},
		{
			columnName: 'AUP_NUMBER',
			type: 'nvarchar',
			required: true,
			prettyName: 'AUP Number (Required Field)'
		},
		{
			columnName: 'NUMBER',
			prettyName: 'Number of Animals',
			type: 'nvarchar'
		},
		{
			columnName: 'DESCRIPTION',
			prettyName: 'Description of Animals (sex, breed, etc.)',
			type: 'nvarchar'
		},
		{
			columnName: 'SOURCE',
			prettyName: 'Source of Animals',
			type: 'nvarchar'
		},
		{
			columnName: 'FINAL_DISPOSITION',
			prettyName: 'Final Disposition of Animals',
			type: 'nvarchar'
		},
		{
			columnName: 'FEEDING_REGIME',
			prettyName: 'Describe feeding regime, including composition of diet(s) (If special feed is needed, has feed mill been contacted?)',
			type: 'nvarchar'
		},
		{
			columnName: 'TOTAL_FEED_AMOUNT',
			prettyName: 'Total amount of feed needed',
			type: 'nvarchar'
		},
		{
			columnName: 'FEED_STORAGE_LOCATION',
			prettyName: 'Feed storage location (bin number if available)',
			type: 'nvarchar'
		},
		{
			columnName: 'SPECIAL_NEEDS',
			prettyName: 'Special needs necessary to perform project',
			type: 'nvarchar'
		},
		{
			columnName: 'PREPARATION_TEXT',
			prettyName: 'Preparation of Paddocks/Pastures',
			type: 'nvarchar',
			tableGroup: {
				name: 'preparation',
				class: 'text'
			}
		},
		{
			columnName: 'PREPARATION_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'preparation',
				class: 'party'
			}
		},
		{
			columnName: 'FORAGE_TEXT',
			prettyName: 'Forage/Feed Sample Collection',
			type: 'nvarchar',
			tableGroup: {
				name: 'forage',
				class: 'text'
			}
		},
		{
			columnName: 'FORAGE_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'forage',
				class: 'party'
			}
		},
		{
			columnName: 'ROTATIONS_TEXT',
			prettyName: 'Pasture/Paddock/Pen Rotations (both timing and the actual act)',
			type: 'nvarchar',
			tableGroup: {
				name: 'rotations',
				class: 'text'
			}
		},
		{
			columnName: 'ROTATIONS_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'rotations',
				class: 'party'
			}
		},
		{
			columnName: 'TRANSPORTATION_TEXT',
			prettyName: 'Transportation (animals between test stations, feed transportation, etc.)',
			type: 'nvarchar',
			tableGroup: {
				name: 'transportation',
				class: 'text'
			}
		},
		{
			columnName: 'TRANSPORTATION_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'transportation',
				class: 'party'
			}
		},
		{
			columnName: 'NUTRITION_TEXT',
			prettyName: 'Feeding of Animals (supplements, minerals, etc.)',
			type: 'nvarchar',
			tableGroup: {
				name: 'nutrition',
				class: 'text'
			}
		},
		{
			columnName: 'NUTRITION_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'nutrition',
				class: 'party'
			}
		},
		{
			columnName: 'HEALTH_TEXT',
			prettyName: 'Administering Experimental Protocol (medications, etc.)',
			type: 'nvarchar',
			tableGroup: {
				name: 'health',
				class: 'text'
			}
		},
		{
			columnName: 'HEALTH_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'health',
				class: 'party'
			}
		},
		{
			columnName: 'BREEDING_TEXT',
			prettyName: 'Breeding Procedures (if different from standard practices on farm)',
			type: 'nvarchar',
			tableGroup: {
				name: 'breeding',
				class: 'text'
			}
		},
		{
			columnName: 'BREEDING_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'breeding',
				class: 'party'
			}
		},
		{
			columnName: 'PHENOTYPE_TEXT',
			prettyName: 'Collection of Phenotypic Data',
			type: 'nvarchar',
			tableGroup: {
				name: 'phenotype',
				class: 'text'
			}
		},
		{
			columnName: 'PHENOTYPE_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'phenotype',
				class: 'party'
			}
		},
		{
			columnName: 'RECORD_KEEPING_TEXT',
			prettyName: 'Record Keeping (dates of procedures)',
			type: 'nvarchar',
			tableGroup: {
				name: 'recordKeeping',
				class: 'text'
			}
		},
		{
			columnName: 'RECORD_KEEPING_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'recordKeeping',
				class: 'party'
			}
		},
		{
			columnName: 'SAMPLE_COLLECTION_TEXT',
			prettyName: 'Sample Collection (blood, fecal, milk, etc.)',
			type: 'nvarchar',
			tableGroup: {
				name: 'sampleCollection',
				class: 'text'
			}
		},
		{
			columnName: 'SAMPLE_COLLECTION_PARTY_ID',
			type: 'int',
			tableGroup: {
				name: 'sampleCollection',
				class: 'party'
			}
		}
	],
	associations: [
		{
			title: 'Important Dates',
			schema: importantDateSchema,
			localKey: 'ID',
			associatedColumn: 'SUPPLEMENTAL_ANIMAL_INFO_ID'

			// IsAssignable: true
		}
	]
};

export default supplementalAnimalInfoSchema;
