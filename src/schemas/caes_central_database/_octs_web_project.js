const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: '_OCTS_WEB_PROJECT',
	title: 'OCTS Web Project',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'PROJECT_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'DEVELOPMENT_FILE_PATH',
			type: 'nvarchar'
		},
		{
			columnName: 'DEVELOPMENT_WEB_PATH',
			type: 'nvarchar'
		},
		{
			columnName: 'PRODUCTION_FILE_PATH',
			type: 'nvarchar'
		},
		{
			columnName: 'PRODUCTION_WEB_PATH',
			type: 'nvarchar'
		},
		{
			columnName: 'HELP_DOCUMENTATION_LOCATION',
			type: 'nvarchar'
		},
		{
			columnName: 'BUSINESS_NEEDS',
			type: 'nvarchar'
		},
		{
			columnName: 'NOTES',
			type: 'nvarchar'
		},
		{
			columnName: 'PROJECT_TYPE',
			type: 'nvarchar'
		},
		{
			columnName: 'ACTION_NEEDED',
			type: 'nvarchar'
		},
		{
			columnName: 'PHASE',
			type: 'nvarchar'
		},
		{
			columnName: 'STATUS',
			type: 'nvarchar'
		},
		{
			columnName: 'MAINTENANCE_STATUS',
			type: 'nvarchar'
		},
		{
			columnName: 'CLIENT',
			type: 'nvarchar'
		},
		{
			columnName: 'USER_BASE',
			type: 'nvarchar'
		},
		{
			columnName: 'ESTIMATED_USER_BASE_SIZE',
			type: 'nvarchar'
		},
		{
			columnName: 'DATABASE_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'BEGIN_DATE',
			type: 'nvarchar'
		},
		{
			columnName: 'LAUNCH_DATE',
			type: 'nvarchar'
		},
		{
			columnName: 'RETIRE_DATE',
			type: 'nvarchar'
		},
		{
			columnName: 'PROJECT_CONTACT',
			type: 'nvarchar'
		},
		{
			columnName: 'FIRST_TIER_SUPPORT',
			type: 'nvarchar'
		},
		{
			columnName: 'ADDITIONAL_SUPPORT',
			type: 'nvarchar'
		},
		{
			columnName: 'PRIMARY_DEVELOPER',
			type: 'nvarchar'
		},
		{
			columnName: 'OTHER_DEVELOPER',
			type: 'nvarchar'
		},
		{
			columnName: 'IIS_WEBSITE',
			type: 'nvarchar'
		},
		{
			columnName: 'CF_APPLICATION_NAME',
			type: 'nvarchar'
		},
		{
			columnName: 'AUTHENTICATION_TYPE',
			type: 'nvarchar'
		},
		{
			columnName: 'IS_INTERNAL_ONLY',
			type: 'bit'
		},
		{
			columnName: 'MODULE_ID',
			type: 'int',
			prettyName: 'MODULE_ID',
			constraint: {
				database: 'CAES_CENTRAL_DATABASE',
				table: 'MODULE',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'USES_SSNS',
			type: 'bit'
		},
		{
			columnName: 'SSN_DESCRIPTION',
			type: 'nvarchar'
		}
	]
};

export default schema;
