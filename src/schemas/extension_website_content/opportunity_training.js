const schema = {
	database: 'EXTENSION_WEBSITE_CONTENT',
	table: 'OPPORTUNITY_TRAINING',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			required: true
		},
		{
			columnName: 'TITLE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'DESCRIPTION',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'CONTACT_PERSON',
			type: 'nvarchar'
		},
		{
			columnName: 'CONTACT_PERSON_EMAIL',
			type: 'nvarchar'
		},
		{
			columnName: 'CONTACT_PERSON_PHONE',
			type: 'nvarchar'
		}
	]
};

export default schema;
