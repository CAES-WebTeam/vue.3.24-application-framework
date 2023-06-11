const schema = {
	database: 'CAES_NEWS',
	table: 'ASSOCIATION_STORY_WRITER',
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
			columnName: 'WRITER_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_NEWS',
				table: 'STORY_WRITER',
				foreignKey: 'ID',
				values: []
			}
		}
	]
};

export default schema;
