const schema = {
	database: 'EXTENSION_WEBSITE_CONTENT',
	table: 'ASSOCIATION_OPPORTUNITY_TOPIC',
	columns: [
		{
			columnName: 'OPPORTUNITY_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'EXTENSION_WEBSITE_CONTENT',
				table: 'EDUCATIONAL_OPPORTUNITY',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'TOPIC_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'EXTENSION_WEBSITE_CONTENT',
				table: 'EXTENSION_TOPIC',
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: []
			}
		}
	]
};

export default schema;
