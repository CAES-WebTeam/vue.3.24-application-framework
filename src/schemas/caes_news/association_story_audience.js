const schema = {
	database: 'CAES_NEWS',
	table: 'ASSOCIATION_STORY_AUDIENCE',
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
			columnName: 'AUDIENCE_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_NEWS',
				table: 'STORY_AUDIENCE',
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				foreignDescription: 'DESCRIPTION',
				values: []
			}
		}
	]
};

export default schema;
