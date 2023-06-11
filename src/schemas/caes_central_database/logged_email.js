const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'LOGGED_EMAIL',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'MODULE_ID',
			type: 'int',
			required: true,
			prettyName: 'Module ID',
			constraint: {
				database: 'CAES_CENTRAL_DATABASE',
				table: 'MODULE',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'SUBJECT_LINE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SERVER_LINE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'FROM_LINE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'TO_LINE',
			type: 'ntext',
			required: true
		},
		{
			columnName: 'CC_LINE',
			type: 'ntext'
		},
		{
			columnName: 'BCC_LINE',
			type: 'ntext'
		},
		{
			columnName: 'BODY_TEXT',
			type: 'ntext',
			required: true
		},
		{
			columnName: 'IS_SENT',
			type: 'bit',
			required: true
		},
		{
			columnName: 'ATTACHMENT_LIST',
			type: 'nvarchar'
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			type: 'datetime',
			required: true
		}
	]
};

export default schema;
