const schema = {
	database: 'CAES_NEWS',
	table: 'ASSOCIATION_STORY_SOURCE_EXPERT',
	columns: [
		{
			columnName: 'STORY_ID',
			prettyName: 'Story ID',
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
			columnName: 'SOURCE_EXPERT_ID',
			prettyName: 'Source Expert ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_NEWS',
				table: 'STORY_SOURCE_EXPERT',
				foreignKey: 'ID',
				values: []
			}
		}
	]
};

export default schema;
