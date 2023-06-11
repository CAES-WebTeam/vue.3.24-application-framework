import associationOpportunityTopicSchema from '~/schemas/extension_website_content/association_opportunity_topic';
import opportunityDateSchema from '~/schemas/extension_website_content/opportunity_date';

const schema = {
	database: 'EXTENSION_WEBSITE_CONTENT',
	table: 'EDUCATIONAL_OPPORTUNITY',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'TITLE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'DESCRIPTION',
			type: 'nvarchar'
		},
		{
			columnName: 'TRAINING_ID',
			prettyName: 'Training/Series',
			type: 'int',
			constraint: {
				database: 'EXTENSION_WEBSITE_CONTENT',
				table: 'OPPORTUNITY_TRAINING',
				foreignKey: 'ID',
				foreignLabel: 'TITLE',
				values: []
			}
		},
		{
			columnName: 'WEB_ADDRESS',
			type: 'nvarchar'
		},
		{
			columnName: 'WEB_ADDRESS_LABEL',
			type: 'nvarchar'
		},
		{
			columnName: 'COST',
			type: 'nvarchar'
		},
		{
			columnName: 'LOCATION',
			type: 'nvarchar'
		},
		{
			columnName: 'ADDRESS_1',
			type: 'nvarchar'
		},
		{
			columnName: 'ADDRESS_2',
			type: 'nvarchar'
		},
		{
			columnName: 'CITY',
			type: 'nvarchar'
		},
		{
			columnName: 'STATE_ABBREVIATION',
			type: 'char'
		},
		{
			columnName: 'ZIPCODE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'MULTIPLE_LOCATIONS',
			type: 'bit',
			required: true
		},
		{
			columnName: 'LOCATION_DETAILS',
			type: 'nvarchar'
		},
		{
			columnName: 'PARKING_INFO',
			type: 'nvarchar'
		},
		{
			columnName: 'COUNTY_OFFICE_ID',
			type: 'int'
		},
		{
			columnName: 'OPEN_TO_OTHER_COUNTIES',
			type: 'bit'
		},
		{
			columnName: 'HIDE_FROM_MASTER_CALENDAR',
			type: 'bit',
			required: true
		},
		{
			columnName: 'REGION_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'EXTENSION_WEBSITE_CONTENT',
				table: 'OPPORTUNITY_REGION',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'CONTACT_INFO',
			type: 'nvarchar'
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
		},
		{
			columnName: 'SUBMITTER_NAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SUBMITTER_EMAIL',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SUBMITTER_USERNAME',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SUBMITTER_PHONE',
			type: 'nvarchar'
		},
		{
			columnName: 'IS_ONLINE',
			type: 'bit',
			required: true
		},
		{
			columnName: 'ONLINE_WEB_ADDRESS',
			type: 'nvarchar',
			depends: {
				column: 'IS_ONLINE',
				test (val) {
					return val === true;
				}
			}
		},
		{
			columnName: 'ONLINE_WEB_ADDRESS_LABEL',
			type: 'nvarchar',
			depends: {
				column: 'IS_ONLINE',
				test (val) {
					return val === true;
				}
			}
		},
		{
			columnName: 'REGISTRATION_INFO',
			type: 'nvarchar'
		},
		{
			columnName: 'NEEDS_CONFERENCE_CENTER_REGISTRATION',
			type: 'bit',
			required: true
		},
		{
			columnName: 'REGISTRATION_LINK',
			type: 'nvarchar'
		},
		{
			columnName: 'CONFERENCE_CENTER_INFO',
			type: 'nvarchar'
		},
		{
			columnName: 'DISPLAY_START_DATE',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'DISPLAY_END_DATE',
			type: 'datetime',
			required: true
		},
		{
			columnName: 'ATTACHMENT_FILE_NAME_1',
			type: 'nvarchar'
		},
		{
			columnName: 'ATTACHMENT_LABEL_1',
			type: 'nvarchar'
		},
		{
			columnName: 'ATTACHMENT_FILE_NAME_2',
			type: 'nvarchar'
		},
		{
			columnName: 'ATTACHMENT_LABEL_2',
			type: 'nvarchar'
		},
		{
			columnName: 'ATTACHMENT_FILE_NAME_3',
			type: 'nvarchar'
		},
		{
			columnName: 'ATTACHMENT_LABEL_3',
			type: 'nvarchar'
		},
		{
			columnName: 'IS_CANCELED',
			type: 'bit',
			required: true
		},
		{
			columnName: 'IS_APPROVED',
			type: 'bit',
			required: true
		},
		{
			columnName: 'IS_4H',
			type: 'bit'
		},
		{
			columnName: 'IMAGE_FILE_1',
			type: 'nvarchar'
		},
		{
			columnName: 'IMAGE_FILE_2',
			type: 'nvarchar'
		},
		{
			columnName: 'ADMINISTRATOR_EMAIL',
			type: 'nvarchar'
		},
		{
			columnName: 'DATE_SUBMITTED',
			type: 'datetime'
		},
		{
			columnName: 'NEED_OCTS_HELP_PROMOTING',
			type: 'bit'
		}
	],
	associations: [
		{
			title: 'Dates',
			schema: opportunityDateSchema,
			localKey: 'ID',
			foreignKey: 'OPPORTUNITY_ID',
			isAssignable: true
		},
		{
			title: 'Topics',
			schema: associationOpportunityTopicSchema,
			localKey: 'ID',
			foreignKey: 'OPPORTUNITY_ID',
			associatedColumn: 'TOPIC_ID',
			multiSelect: true,
			groupBy: 'PARENT_ID'
		}
	]
};

export default schema;
