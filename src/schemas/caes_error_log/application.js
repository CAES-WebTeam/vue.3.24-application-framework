import associationDeveloperApplicationSchema from '~/schemas/caes_error_log/association_developer_application';
import errorReportSchema from '~/schemas/caes_error_log/error_report';

const schema = {
	database: 'CAES_ERROR_LOG',
	table: 'APPLICATION',
	title: 'Application',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			prettyName: 'ID',
			immutable: true
		},
		{
			columnName: 'APPLICATION_NAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'BASE_TEMPLATE_PATH',
			type: 'nvarchar'
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
	],
	associations: [
		{
			title: 'Developers',
			schema: associationDeveloperApplicationSchema,
			localKey: 'ID',
			foreignKey: 'APPLICATION_ID',
			isAssignable: true
		},
		{
			title: 'Error Reports',
			schema: errorReportSchema,
			localKey: 'ID',
			foreignKey: 'APPLICATION_ID'
		}
	]
};

export default schema;
