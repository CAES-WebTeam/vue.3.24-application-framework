import {
	getAssociationReportTopic,
	getAssociationTopicArea
} from '~/modules/caesdb/gacounts3';

const schema = {
	title: 'Report Topics',
	databaseName: 'GACOUNTS3',
	tablePrefix: 'GC3_ASSOCIATION_REPORT_TOPIC',
	criteria: {
		string: 'criteria_ID_eq'
	},
	fetchExisting: getAssociationReportTopic,
	columns: [
		{
			columnName: 'REPORT_ID',
			type: 'int',
			required: true,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'TITLE',
				values: []
			}
		},
		{
			columnName: 'TOPIC_ID',
			type: 'int',
			required: true,
			constraint: {
				getValues: getAssociationTopicArea,
				foreignKey: 'TOPIC_ID',
				foreignLabel: 'TOPIC_LABEL',
				values: []
			}
		}
	]
};

export default schema;
