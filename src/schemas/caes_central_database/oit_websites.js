import oitContentManagerListSchema from '~/schemas/caes_central_database/oit_content_manager_list';

const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'OIT_WEBSITES',
	title: 'OIT Websites',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			prettyName: 'ID',
			immutable: true
		},
		{
			columnName: 'WEBSITE_NAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SITE_TYPE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'FILE_PATH',
			type: 'nvarchar'
		},
		{
			columnName: 'STATUS',
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
			columnName: 'PRIMARY_URL',
			type: 'nvarchar'
		},
		{
			columnName: 'VANITY_URLS',
			type: 'nvarchar'
		},
		{
			columnName: 'AUTHENTICATION_TYPE',
			type: 'nvarchar'
		},
		{
			columnName: 'NOTES',
			type: 'nvarchar'
		},
		{
			columnName: 'MAILCHIMP_INFORMATION',
			type: 'nvarchar'
		},
		{
			columnName: 'SITE_IMPROVE_GROUP',
			type: 'nvarchar'
		},
		{
			columnName: 'SITE_IMPROVE_INFORMATION',
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
	],
	associations: [
		{
			title: 'Content Managers',
			schema: oitContentManagerListSchema,
			localKey: 'ID',
			foreignKey: 'SITE_ID',
			isAssignable: true
		}
	]
};

export default schema;
