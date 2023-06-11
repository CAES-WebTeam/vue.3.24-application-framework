import associationStoryAudienceSchema from '~/schemas/caes_news/association_story_audience';
import associationStoryKeywordSchema from '~/schemas/caes_news/association_story_keyword';
import associationStorySourceExpertSchema from '~/schemas/caes_news/association_story_source_expert';
import associationStoryWriterSchema from '~/schemas/caes_news/association_story_writer';
import dateFormat from 'dateformat';

const schema = {
	database: 'CAES_NEWS',
	table: 'STORY',
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID'
		},
		{
			columnName: 'LONG_TITLE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SHORT_TITLE',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'SHORT_TEASER',
			type: 'nvarchar',
			required: true
		},
		{
			columnName: 'LEAD_PARAGRAPH',
			type: 'ntext',
			required: true
		},
		{
			columnName: 'BODY',
			type: 'nvarchar',
			required: true,
			inputType: 'richtext'
		},
		{
			columnName: 'STATUS_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_NEWS',
				table: 'STORY_STATUS',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'OMITS_BYLINE',
			prettyName: 'Hide Byline',
			type: 'bit',
			required: true
		},
		{
			columnName: 'OMITS_TAGLINE',
			prettyName: 'Hide Tagline',
			type: 'bit',
			required: true
		},
		{
			columnName: 'IS_FEATURED',
			prettyName: 'Featured',
			type: 'bit',
			required: true
		},
		{
			columnName: 'STORY_PROOFER_ID',
			type: 'int',
			required: true,
			constraint: {
				database: 'CAES_NEWS',
				table: 'STORY_WRITER',
				foreignKey: 'ID',
				values: []
			}
		},
		{
			columnName: 'RELEASE_DATE',
			type: 'datetime',
			required: true,
			default: dateFormat(Date.now(), 'yyyy-mm-dd')
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
			title: 'Writers',
			schema: associationStoryWriterSchema,
			localKey: 'ID',
			foreignKey: 'STORY_ID',
			isAssignable: true
		},
		{
			title: 'Sources/Experts',
			schema: associationStorySourceExpertSchema,
			localKey: 'ID',
			foreignKey: 'STORY_ID',
			isAssignable: true
		},
		{
			title: 'Audiences',
			schema: associationStoryAudienceSchema,
			localKey: 'ID',
			foreignKey: 'STORY_ID',
			associatedColumn: 'AUDIENCE_ID',
			multiSelect: true
		},
		{
			title: 'Keywords',
			schema: associationStoryKeywordSchema,
			localKey: 'ID',
			foreignKey: 'STORY_ID',
			associatedColumn: 'KEYWORD_ID',
			multiSelect: true,
			groupBy: 'TYPE_ID'
		},
		{
			title: 'Images',
			isExternal: true,
			source: {
				url: `https://${window.location.hostname}/news/admin/index.cfm?referenceInterface=STORY&subInterface=detail_ASSOCIATION_STORY_IMAGE`,
				selector: 'PK_ID',
				hasParams: true
			}
		}
	]
};

export default schema;
