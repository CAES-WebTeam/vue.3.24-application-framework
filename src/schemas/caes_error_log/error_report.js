const schema = {
	database: 'CAES_ERROR_LOG',
	table: 'ERROR_REPORT',
	title: 'Error Reports',
	disableInsert: true,
	disableUpdate: true,
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			prettyName: 'ID',
			immutable: true
		},
		{
			columnName: 'APPLICATION_ID',
			type: 'int',
			prettyName: 'Application',
			immutable: true,
			constraint: {
				database: 'CAES_ERROR_LOG',
				table: 'APPLICATION',
				foreignKey: 'ID',
				foreignLabel: 'APPLICATION_NAME',
				values: []
			}
		},
		{
			columnName: 'FIXED_DEVELOPMENT',
			immutable: true,
			type: 'bit'
		},
		{
			columnName: 'FIXED_PRODUCTION',
			immutable: true,
			type: 'bit'
		},
		{
			columnName: 'DATE_CREATED',
			immutable: true,
			type: 'datetime'
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			immutable: true,
			type: 'datetime'
		},
		{
			columnName: 'BROWSER',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'ERROR_DATETIME',
			immutable: true,
			type: 'datetime'
		},
		{
			columnName: 'DETAIL',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'ERROR_DIAGNOSTICS',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'ERROR_CODE',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'EXTENDED_INFO',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'HTTP_REFERER',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'MAIL_TO',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'MESSAGE',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'NATIVE_ERROR_CODE',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'QUERY_STRING',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'REMOTE_ADDRESS',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'ERROR_SQLSTATE',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'TAG_CONTEXT',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'TEMPLATE',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'TYPE',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'SQL_STATEMENT',
			immutable: true,
			type: 'nvarchar',
			prettyName: 'SQL Statement'
		},
		{
			columnName: 'SESSION_DUMP',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'URL_DUMP',
			immutable: true,
			type: 'nvarchar',
			prettyName: 'URL Dump'
		},
		{
			columnName: 'FORM_DUMP',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'CGI_DUMP',
			immutable: true,
			type: 'nvarchar',
			prettyName: 'CGI Dump'
		},
		{
			columnName: 'APPLICATION_DUMP',
			immutable: true,
			type: 'nvarchar'
		},
		{
			columnName: 'REQUEST_DUMP',
			immutable: true,
			type: 'nvarchar'
		}
	]
};

export default schema;
