import associationDeveloperApplicationSchema from '~/schemas/caes_error_log/association_developer_application';

const schema = {
	database: 'CAES_ERROR_LOG',
	table: 'DEVELOPER',
	title: 'Developers',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			prettyName: 'ID',
			immutable: true,
			required: true
		},
		{
			columnName: 'PERSONNEL_ID',
			type: 'int',
			prettyName: 'Personnel ID',
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
	],
	associations: [
		{
			title: 'Applications',
			schema: associationDeveloperApplicationSchema,
			localKey: 'ID',
			foreignKey: 'DEVELOPER_ID'
		}
	]
};

export default schema;
