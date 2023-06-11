const schema = {
	database: 'CAES_NEWS',
	table: 'ASSOCIATION_MEDIA_KIT_STORY',
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
			columnName: 'MEDIA_KIT_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_NEWS',
				table: 'MEDIA_KIT',
				foreignKey: 'ID',
				foreignLabel: 'TITLE',
				foreignDescription: 'SUMMARY',
				values: []
			}
		}
	]
};

export default schema;
