import associationPersonnelModuleSchema from '~/schemas/caes_central_database/association_personnel_module';
import associationWorkingGroupModuleSchema from '~/schemas/caes_central_database/association_working_group_module';

const schema = {
	database: 'CAES_CENTRAL_DATABASE',
	table: 'MODULE',
	title: 'OIT Modules',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			prettyName: 'ID',
			immutable: true
		},
		{
			columnName: 'NAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'LABEL',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'URL',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SESSION_DURATION',
			type: 'int',
			required: true
		},
		{
			columnName: 'AUTO_APPROVE',
			type: 'bit',
			required: true
		},
		{
			columnName: 'COMPONENT_PATH',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'USES_SSO_MYID_AUTHENTICATION',
			type: 'bit',
			required: true
		},
		{
			columnName: 'USES_SSO_AD_AUTHENTICATION',
			type: 'bit',
			required: true
		},
		{
			columnName: 'USES_BASIC_AUTHENTICATION',
			type: 'bit',
			required: true
		},
		{
			columnName: 'IS_ACTIVE',
			type: 'bit',
			required: true
		}
	],
	associations: [
		{
			title: 'Personnel',
			schema: associationPersonnelModuleSchema,
			localKey: 'ID',
			foreignKey: 'MODULE_ID',
			isAssignable: true
		},
		{
			title: 'Working Groups',
			schema: associationWorkingGroupModuleSchema,
			localKey: 'ID',
			foreignKey: 'MODULE_ID',
			isAssignable: true
		}
	]
};

export default schema;
