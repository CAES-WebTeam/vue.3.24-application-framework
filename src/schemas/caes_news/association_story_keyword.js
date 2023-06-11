const schema = {
	database: 'CAES_NEWS',
	table: 'ASSOCIATION_STORY_KEYWORD',
	columns: [
		{
			columnName: 'STORY_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_NEWS',
				table: 'STORY',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'KEYWORD_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'EXTENSION_WEBSITE_CONTENT',
				table: 'KEYWORD',
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: []
			}
		}
	]
};

export default schema;
