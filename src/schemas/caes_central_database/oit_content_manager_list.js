const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'OIT_CONTENT_MANAGER_LIST',
	title: 'OIT Content Manager List',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			prettyName: 'ID',
			immutable: true
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
			columnName: 'LAST_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'EMAIL',
			type: 'nvarchar'
		},
		{
			columnName: 'NON_CAES_IS_ACTIVE',
			type: 'bit'
		},
		{
			columnName: 'SITE_ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'USERNAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'AD_GROUP',
			type: 'nvarchar'
		},
		{
			columnName: 'TRAINING_DATE',
			type: 'datetime'
		},
		{
			columnName: 'GETS_SITE_IMPROVE_REPORTS',
			type: 'bit'
		},
		{
			columnName: 'NOTES',
			type: 'nvarchar'
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime'
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			type: 'datetime'
		}
	]
};

export default schema;
