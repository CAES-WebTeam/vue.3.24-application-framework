const schema = {
	database: 'CAES_NEWS',
	table: 'ASSOCIATION_STORY_IMAGE',
	columns: [
		{
			columnName: 'STORY_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'IMAGE_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'CAPTION',
			type: 'nvarchar'
		},
		{
			columnName: 'LABEL',
			type: 'nvarchar'
		},
		{
			columnName: 'IS_PRIMARY',
			type: 'bit',
			required: true
		},
		{
			columnName: 'SEQUENCE_NUMBER',
			type: 'int',
			required: true
		}
	]
};

export default schema;
