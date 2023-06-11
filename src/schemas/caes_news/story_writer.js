const schema = {
	database: 'CAES_NEWS',
	table: 'STORY_WRITER',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'PERSONNEL_ID',
			type: 'int'
		},
		{
			columnName: 'FIRST_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'MIDDLE_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'LAST_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'SUFFIX',
			type: 'nvarchar'
		},
		{
			columnName: 'EMAIL',
			type: 'nvarchar'
		},
		{
			columnName: 'PHONE',
			type: 'nvarchar'
		},
		{
			columnName: 'COVERAGE_AREA',
			type: 'nvarchar'
		},
		{
			columnName: 'TAGLINE',
			type: 'nvarchar'
		},
		{
			columnName: 'IS_MEDIA_CONTACT',
			type: 'bit',
			required: true
		},
		{
			columnName: 'IS_PROOFER',
			type: 'bit',
			required: true
		},
		{
			columnName: 'IS_ACTIVE',
			type: 'bit',
			required: true
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			type: 'datetime',
			required: true
		}
	]
};

export default schema;
