/* global activeUser */
/* global actualUser */
/* global caesCache */
/* global swal */

// Pull in required modules
import { ccdAssociationKeywordTopicCriteriaStructure } from '~/criteriaStructures/caes_central_database';
import FourHImportComponent from '~/views/custom/gacounts3/FourHImport';
import MediaProducedComponent from '~/views/custom/gacounts3/MediaProduced';
import RADIO_OPTIONS_BOOLEAN from '~/globals/radio-options-boolean';
import { singleItem } from '@gabegabegabe/utils/dist/array/reducers';
import ReportType from '~/views/custom/gacounts3/ReportType';
import SubReportCollaborators from '~/views/custom/gacounts3/SubReportCollaborators';
import SubReportForReportComponent from '~/views/custom/gacounts3/SubReportForReport';
import SupplementalDataComponent from '~/views/custom/gacounts3/SupplementalData';
import { toKey } from '@gabegabegabe/utils/dist/array/mappers';
import {
	associationReport4HEnrollmentActivitySchema,
	associationReportAttachmentsSchema,
	associationReportFieldSchema,
	associationReportKeywordSchema,
	associationReportProgramAreaSchema,
	associationReportTopicSchema,
	associationReportTypeSchema,
	ethnicDemographicSchema,
	mediaDistributedSchema,
	mediaProductionSchema,
	mediaReviewSchema,
	racialDemographicSchema,
	reportContactSchema,
	reportPersonnelSchema,
	residenceDemographicSchema,
	subReportSchema,
	targetAudienceSchema
} from '~/schemas/gacounts3';
import {
	deleteReport,
	getAssociationKeywordTopic,
	getAssociationReportTypeContactType,
	getAssociationReportTypeProgramArea,
	getAssociationTargetAudienceProgramArea,
	getContextualHelpMessageHTML,
	getReport,
	postReportData
} from '~/modules/caesdb/gacounts3';
import {
	gc3AssociationReportTypeContactTypeCriteriaStructure,
	gc3TargetAudienceCriteriaStructure
} from '~/criteriaStructures/gacounts3';

// Adjust the racial demographic schema to suit our needs
const altRacialDemographicSchema = { ...racialDemographicSchema };
altRacialDemographicSchema.columns = [];
racialDemographicSchema.columns.forEach(column => {
	if (column.columnName !== 'GENDER_ID' && column.columnName !== 'QUANTITY') altRacialDemographicSchema.columns.push(column);
});
altRacialDemographicSchema.columns.push({
	columnName: 'QUANTITY_MALE',
	prettyName: 'Male',
	type: 'int',
	min: 0
});
altRacialDemographicSchema.columns.push({
	columnName: 'QUANTITY_FEMALE',
	prettyName: 'Female',
	type: 'int',
	min: 0
});
altRacialDemographicSchema.columns.push({
	columnName: 'QUANTITY_OTHER',
	prettyName: 'Other/Unidentified',
	type: 'int',
	min: 0
});
altRacialDemographicSchema.prepareForSubmit = newRecords => {
	// An array to hold our records to be submitted
	const transformedRecords = [];
	newRecords.forEach(record => {
		if (record.QUANTITY_MALE > 0 || record.QUANTITY_FEMALE > 0 || record.QUANTITY_OTHER > 0) {
			const newRecordTemplate = {};
			for (const key in record)  {
				if (key !== 'QUANTITY_MALE' && key !== 'QUANTITY_FEMALE'
				 	&& key !== 'QUANTITY_OTHER') newRecordTemplate[key] = record[key];
			}

			if (record.QUANTITY_MALE > 0) {
				const maleRecord = { ...newRecordTemplate };
				maleRecord.GENDER_ID = 1;
				maleRecord.QUANTITY = record.QUANTITY_MALE;
				transformedRecords.push(maleRecord);
			}
			if (record.QUANTITY_FEMALE > 0) {
				const femaleRecord = { ...newRecordTemplate };
				femaleRecord.GENDER_ID = 2;
				femaleRecord.QUANTITY = record.QUANTITY_FEMALE;
				transformedRecords.push(femaleRecord);
			}
			if (record.QUANTITY_OTHER > 0) {
				const otherRecord = { ...newRecordTemplate };
				otherRecord.GENDER_ID = 3;
				otherRecord.QUANTITY = record.QUANTITY_OTHER;
				transformedRecords.push(otherRecord);
			}
		}
	});

	return transformedRecords;
};
altRacialDemographicSchema.prepareFromRetrieval = (existingRecords, componentRecords) => {
	existingRecords.forEach(record => {
		const componentRecordsRaceMap = componentRecords.map(r => r.RACE_ID);
		const matchingRecord = componentRecords[componentRecordsRaceMap.indexOf(record.RACE_ID)];
		if (record.GENDER_ID === 1) matchingRecord.QUANTITY_MALE = record.QUANTITY;
		else if (record.GENDER_ID === 2) matchingRecord.QUANTITY_FEMALE = record.QUANTITY;
		else if (record.GENDER_ID === 3) matchingRecord.QUANTITY_OTHER = record.QUANTITY;
	});
};

// Adjust the ethnic demographic schema to suit our needs
const altEthnicDemographicSchema = { ...ethnicDemographicSchema };
altEthnicDemographicSchema.columns = [];
ethnicDemographicSchema.columns.forEach(column => {
	if (column.columnName !== 'GENDER_ID' && column.columnName !== 'QUANTITY') altEthnicDemographicSchema.columns.push(column);
});
altEthnicDemographicSchema.columns.push({
	columnName: 'QUANTITY_MALE',
	prettyName: 'Male',
	type: 'int'
});
altEthnicDemographicSchema.columns.push({
	columnName: 'QUANTITY_FEMALE',
	prettyName: 'Female',
	type: 'int'
});
altEthnicDemographicSchema.columns.push({
	columnName: 'QUANTITY_OTHER',
	prettyName: 'Other/Unidentified',
	type: 'int'
});
altEthnicDemographicSchema.prepareForSubmit = altRacialDemographicSchema.prepareForSubmit;
altEthnicDemographicSchema.prepareFromRetrieval = (existingRecords, componentRecords) => {
	existingRecords.forEach(record => {
		const componentRecordsEthnicMap = componentRecords.map(r => r.ETHNICITY_ID);
		const matchingRecord = componentRecords[componentRecordsEthnicMap.indexOf(record.ETHNICITY_ID)];
		if (record.GENDER_ID === 1) matchingRecord.QUANTITY_MALE = record.QUANTITY;
		else if (record.GENDER_ID === 2) matchingRecord.QUANTITY_FEMALE = record.QUANTITY;
		else if (record.GENDER_ID === 3) matchingRecord.QUANTITY_OTHER = record.QUANTITY;
	});
};

// Define our demographics test function to be reused for each of the
// demographic associations
const demographicsTest = (records, schema) => {
	let passes = false;
	const associationsMap = schema.associations.map(a => a.title);
	const association = schema.associations[associationsMap.indexOf('Contacts')];
	const columnsMap = association.schema.columns.map(c => c.columnName);
	const column = association.schema.columns[columnsMap.indexOf('TYPE_ID')];
	const { values } = column.constraint;
	const valuesIdMap = values.map(v => v.key);
	const valuesUsesDemographicsMap = values.map(v => {
		if (v.originalValue) return v.originalValue.USES_DEMOGRAPHICS;

		 return v.USES_DEMOGRAPHICS;
	});
	records.forEach(record => {
		if (valuesUsesDemographicsMap[valuesIdMap.indexOf(record.TYPE_ID)]) passes = true;
	});

	return passes;
};

const demographicsCollectionMethodTest = (columnValue, records, schema) => {

	//don't show if value is unknown (reports prior to Jan 2021)
	if ( columnValue === caesCache.data.gc3.demographicCollectionMethod.find( ({ LABEL }) => LABEL === 'Unknown' ).ID) return false;

	let passes = false;
	const associationsMap = schema.associations.map(a => a.title);
	const association = schema.associations[associationsMap.indexOf('Contacts')];
	const columnsMap = association.schema.columns.map(c => c.columnName);
	const column = association.schema.columns[columnsMap.indexOf('TYPE_ID')];
	const { values } = column.constraint;
	const valuesIdMap = values.map(v => v.key);
	const valuesUsesDemographicsMap = values.map(v => {
		if (v.originalValue) return v.originalValue.USES_DEMOGRAPHICS;

		 return v.USES_DEMOGRAPHICS;
	});
	records.forEach(record => {
		if (valuesUsesDemographicsMap[valuesIdMap.indexOf(record.TYPE_ID)]) passes = true;
	});

	return passes;
};

// Function to determine if a county id is required
const countyIdRequired = val => {
	const activityLocationMap = caesCache.data.gc3.activityLocationType.map(location => location.ID);
	const activityLocationIndex = activityLocationMap.indexOf(Number(val));
	if (activityLocationIndex === -1) return false;
	const activityLocationType = caesCache.data.gc3.activityLocationType[activityLocationIndex];

	return Boolean(activityLocationType.USES_COUNTY_ID);
};

// And finally define the schema itself
const schema = {
	title: 'Report',
	tablePrefix: 'GC3_REPORT',
	databaseName: 'GACOUNTS3',
	messageFetcher: getContextualHelpMessageHTML,
	criteria: {
		string: 'criteria_ID_eq'
	},
	deleteExisting: deleteReport,
	fetchExisting: getReport,
	processSubmission: (report, callback) => {
		// These functions examine multiple objects having keys 'TYPE_ID' and 'ID', respectively, and returning
		// just lists of the type ID and ID for these objects.
		const reportTypeId = report.reportType.records.map(toKey('TYPE_ID')).reduce(singleItem);
		// Gabe's fix! Don't misplace!
		// const reportTypeId = report.reportType.records.length < 1 ? -1 : report.reportType.records.map(toKey('TYPE_ID')).reduce(singleItem);
		const isMediaProducedDistributed = caesCache.data.gc3.reportType
			.filter(({ LABEL }) => LABEL === 'Media Produced/Distributed')
			.map(toKey('ID'))
			.reduce(singleItem) === reportTypeId;

		if (isMediaProducedDistributed) {
			const hasDistributedRecords = report.mediaDistributed.records.length > 0;

			if (hasDistributedRecords) postReportData(report, callback);
			else swal.fire({
				title: 'Are you sure?',
				text: 'You have selected Media Produced/Distributed as your report type, but have not entered any Media Distributed records.  Please click the "Save Row" button beside the media distribution line to connect your entry to this report.  If you have no distribution numbers you may dismiss this warning.',
				type: 'warning',
				confirmButtonColor: '#6c3129',
				confirmButtonText: 'Yes',
				cancelButtonColor: '#004e60',
				showCancelButton: true
			}).then(result => {
				if (result.value) postReportData(report, callback);
			});
		} else {
			postReportData(report, callback);
		}
	},

	// ProcessSubmission: (report, callback) => {
	// 	console.log(report);
	// },
	cleanUpData: store => {
		// Remove media distribution/production records if report type does not need
		// them.
		const selectedReportType = store.reportType.records[0] || null;
		if (selectedReportType) {
			const selectedReportTypeId = selectedReportType.TYPE_ID;
			const reportTypeIdMap = caesCache.data.gc3.reportType.map(t => t.ID);
			const index = reportTypeIdMap.indexOf(selectedReportTypeId);
			if (index !== -1) {
				const reportType = caesCache.data.gc3.reportType[index];
				if (!reportType.USES_MEDIA_PRODUCTION) store.mediaProduced.records = [];
				if (!reportType.USES_MEDIA_DISTRIBUTION) store.mediaDistributed.records = [];
			}
		}

		// Remove county ID if not required
		if (!countyIdRequired(store.report.ACTIVITY_LOCATION_TYPE_ID)) store.report.COUNTY_ID = null;

		// Sub-Report must only have a local or state issue, not both.
		const { subReport } = store.subschemas.subReport;
		if (subReport.ISSUE_TYPE === 'local' && subReport.STATE_PLANNED_PROGRAM_ID !== null) subReport.STATE_PLANNED_PROGRAM_ID = null;
		if (subReport.ISSUE_TYPE === 'state' && subReport.PLANNED_PROGRAM_ID !== null) subReport.PLANNED_PROGRAM_ID = null;

		// Clean up sub-report contacts
		store.subschemas.subReport.contacts.records = store.subschemas.subReport.contacts.records.filter(contact => caesCache.data.gc3.associationReportTypeContactType
			.filter(assn => store.reportType.records.map(t => t.TYPE_ID).indexOf(assn.REPORT_TYPE_ID) !== -1)
			.map(assn => assn.CONTACT_TYPE_ID)
			.indexOf(contact.TYPE_ID) !== -1);

		return store;
	},
	columns: [
		{
			columnName: 'ID',
			type: 'int',
			immutable: true,
			prettyName: 'ID',
			automated: true,
			grouping: {
				section: 'Main Report Information',
				order: 1
			}
		},
		{
			columnName: 'OWNER_ID',
			type: 'int',
			required: true,
			automated: true,

			// Default: activeUser.PERSONNEL_ID,
			constraint: {
				foreignKey: 'ID',
				values: []
			},
			grouping: {
				section: 'Main Report Information',
				order: 2
			}
		},
		{
			columnName: 'ACTUAL_SUBMITTER_ID',
			type: 'int',
			required: true,
			automated: true,
			default: actualUser.PERSONNEL_ID,
			constraint: {
				foreignKey: 'ID',
				values: []
			},
			grouping: {
				section: 'Main Report Information',
				order: 3
			}
		},
		{
			columnName: 'TITLE',
			type: 'nvarchar',
			required: true,
			grouping: {
				section: 'Main Report Information',
				order: 4
			},
			style: {
				width: '100%'
			},
			validate (store) {
				const title = store.report.TITLE;

				return {
					isValid: title && typeof title === 'string' && title.length > 3,
					message: 'Your report title must contain more than three characters.'
				};
			}
		},
		{
			columnName: 'SCOPE_ID',
			prettyName: 'Geographic Reach of Activity',
			type: 'int',
			required: true,
			helpMessageName: 'NewReportScope',
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.ccd.programScope
			},
			grouping: {
				section: 'Main Report Information',
				order: 5
			},
			validate (store) {
				if (store.report.SCOPE_ID) return { isValid: true };

				return {
					isValid: false,
					message: 'You must select a value for the geographic reach of your activity.'
				};
			}
		},
		{
			columnName: 'LOCATION_OF_AGENT',
			prettyName: 'Agent\'s County',
			type: 'int',
			constraint: {
				foreignKey: 'COUNTY_OFFICE_ID',
				foreignLabel: 'COUNTYOFFICENAME',
				values: caesCache.data.ccd.associationPersonnelJobRole
					.filter(({ COUNTY_OFFICE_ID }) => COUNTY_OFFICE_ID !== null)
					.filter(({ COUNTY_OFFICE_ID }, i, arr) => arr.map(toKey('COUNTY_OFFICE_ID')).indexOf(COUNTY_OFFICE_ID) === i)
					.sort((a, b) => {
						if (a.COUNTYOFFICENAME > b.COUNTYOFFICENAME) return 1;
						if (a.COUNTYOFFICENAME < b.COUNTYOFFICENAME) return -1;

						return 0;
					})
			},
			default: activeUser.COUNTY_OFFICE_ID,
			depends: {
				test: () => caesCache.data.ccd.associationPersonnelJobRole
					.filter(({ COUNTY_OFFICE_ID }) => COUNTY_OFFICE_ID !== null)
					.filter(({ COUNTY_OFFICE_ID }, i, arr) => arr.map(toKey('COUNTY_OFFICE_ID')).indexOf(COUNTY_OFFICE_ID) === i).length > 1
			},
			grouping: {
				section: 'Main Report Information',
				order: 6
			}
		},
		{
			columnName: 'ACTIVITY_LOCATION_TYPE_ID',
			prettyName: 'Location of Activity',
			type: 'int',
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.gc3.activityLocationType.sort((a, b) => {
					if (a.LABEL > b.LABEL) return 1;
					if (a.LABEL < b.LABEL) return -1;

					return 0;
				})
			},
			grouping: {
				section: 'Main Report Information',
				order: 6
			},
			validate (store) {
				if (store.report.ACTIVITY_LOCATION_TYPE_ID) return { isValid: true };

				return {
					isValid: false,
					message: 'You much select the location of your activity.'
				};
			}
		},
		{
			columnName: 'COUNTY_ID',
			prettyName: 'County',
			type: 'int',
			required: true,
			default: activeUser.COUNTYLISTID,
			helpMessageName: 'NewReportCounty',
			constraint: {
				foreignKey: 'COUNTYLISTID',
				foreignLabel: 'COUNTYNAME',
				values: caesCache.data.pdb.countyList
			},
			depends: {

				column: 'ACTIVITY_LOCATION_TYPE_ID',
				test: countyIdRequired
			},
			grouping: {
				section: 'Main Report Information',
				order: 7
			}
		},
		{
			columnName: 'ACTIVITY_LOCATION_ALTERNATE_TEXT',
			prettyName: 'Out-of-State Location',
			type: 'nvarchar',
			depends: {
				column: 'ACTIVITY_LOCATION_TYPE_ID',
				test (val) {
					const activityLocationMap = caesCache.data.gc3.activityLocationType.map(location => location.ID);
					const activityLocationIndex = activityLocationMap.indexOf(Number(val));

					return activityLocationIndex !== -1 && caesCache.data.gc3.activityLocationType[activityLocationIndex].USES_ALTERNATE_TEXT;
				}
			},
			grouping: {
				section: 'Main Report Information',
				order: 8
			}
		},
		{
			columnName: 'DONE_FULLY_AT_A_DISTANCE',
			prettyName: 'Delivered Fully at a Distance',
			description: 'Example: presentations made via Video Conferencing, Webinars, Facebook Live, etc.',
			type: 'bit',
			inputType: 'radio',
			required: true,
			default: false,
			constraint: { ...RADIO_OPTIONS_BOOLEAN },
			grouping: {
				section: 'Main Report Information',
				order: 9
			}
		},
		{
			columnName: 'DEMOGRAPHIC_COLLECTION_METHOD_ID',
			prettyName: 'Demographic Collection Method',
			type: 'int',
			inputType: 'radio',
			helpMessageName: 'DemographicCollectionMethod',
			default: caesCache.data.gc3.demographicCollectionMethod.find(d => d.IS_DEFAULT === true).ID,
			constraint: {
				foreignKey: 'ID',
				foreignLabel: 'LABEL',
				values: caesCache.data.gc3.demographicCollectionMethod.filter(d => d.IS_VISIBLE === true)
			},
			grouping: {
				section: 'Demographic Information',
				order: 3
			},
			depends: {
				association: 'Contacts',
				useValues: true,
				useColumnValue: true,
				test: demographicsCollectionMethodTest
			}			
		},
		{
			columnName: 'DATE_BEGIN',
			prettyName: 'Begin Date',
			type: 'datetime',
			required: true,
			grouping: {
				section: 'Main Report Information',
				order: 10
			},
			validate (store) {
				const startDate = store.report.DATE_BEGIN ? new Date(store.report.DATE_BEGIN) : null;
				if (startDate !== null && startDate instanceof Date && !isNaN(startDate))

					// Valid
					return {
						isValid: true
					};


				// Invalid
				return {
					isValid: false,
					message: 'You have entered an invalid date for the start date.'
				};
			}
		},
		{
			columnName: 'DATE_END',
			prettyName: 'End Date',
			type: 'datetime',
			required: true,
			description: 'If left blank, end date will be the same as the begin date.',
			grouping: {
				section: 'Main Report Information',
				order: 11
			},
			validate (store) {
				if (store.report.DATE_END) {
					const endDate = new Date(store.report.DATE_END).getTime();
					const startDate = new Date(store.report.DATE_BEGIN).getTime();

					return {
						isValid: endDate >= startDate,
						message: 'The end date for your report must be after the begin date.'
					};
				}

				return {
					isValid: true
				};
			}
		},
		{
			columnName: 'DATE_CREATED',
			type: 'datetime',
			required: true,
			automated: true,
			grouping: {
				section: 'Main Report Information',
				order: 12
			}
		},
		{
			columnName: 'DATE_LAST_UPDATED',
			type: 'datetime',
			required: true,
			automated: true,
			grouping: {
				section: 'Main Report Information',
				order: 13
			}
		}
	],
	associations: [
		{
			title: 'Program Areas',
			schema: associationReportProgramAreaSchema,
			helpMessageName: 'NewReportProgramArea',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'AREA_ID',
			disallowEditOfExisting: true,
			multiSelect: true,
			grouping: {
				section: 'Main Report Information',
				order: 13
			},
			affects: {
				titles: ['Report Types', 'Topics', 'Keywords'],
				showAlways: false
			},
			validate (store) {
				const areas = store.programAreas.records;
				if (areas.length > 0) return { isValid: true };

				return {
					isValid: false,
					message: 'You must select at least one Program Area.'
				};
			}
		},
		{
			title: 'Report Type',
			schema: associationReportTypeSchema,
			customComponent: ReportType,
			helpMessageName: 'NewReportReportType',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'TYPE_ID',
			disallowEditOfExisting: true,
			isAssignable: true,
			forbidMultiple: true,
			grouping: {
				section: 'Main Report Information',
				order: 14
			},
			filter: {
				association: {
					title: 'Program Areas',
					column: 'AREA_ID'
				},
				getValues: getAssociationReportTypeProgramArea,
				associatedColumn: 'AREA_ID',
				optionColumn: 'REPORT_TYPE_ID'
			},
			affects: {
				titles: [
					'Target Audiences',
					'Demographics',
					'Contact Types',
					'Supplemental Data',
					'Sub-Report Roles'
				]
			},
			validate (store) {
				const reportTypeRecords = store.reportType.records;
				if (reportTypeRecords.length === 1) return { isValid: true };

				return {
					isValid: false,
					message: 'You must select a report type.'
				};
			}
		},
		{
			title: 'Topics',
			description: 'Please select at least one topic for each program area you have selected.',
			schema: associationReportTopicSchema,
			helpMessageName: 'NewReportTopic',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'TOPIC_ID',
			disallowEditOfExisting: true,
			multiSelect: true,
			grouping: {
				section: 'Topics and Keywords',
				order: 1
			},
			groupBy: 'AREA_ID',
			groupLabel: 'PROGRAM_AREA_ABBREVIATION',
			groupsToShow: {
				association: 'Program Areas',
				column: 'AREA_ID'
			},
			affects: {
				titles: ['Keywords']
			}
		},
		{
			title: 'Keywords',
			description: 'Please select the 1 to 6 keywords that best apply to the reported activities.',
			schema: associationReportKeywordSchema,
			helpMessageName: 'ReportKeyword',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'KEYWORD_ID',
			multiSelect: true,
			maxAllowed: 6,
			grouping: {
				section: 'Topics and Keywords',
				order: 2
			},
			filter: {
				associations: [
					{
						title: 'Program Areas',
						column: 'AREA_ID'
					},
					{
						title: 'Topics',
						column: 'TOPIC_ID'
					}
				],
				getValues: getAssociationKeywordTopic,
				database: 'CAES_CENTRAL_DATABASE',
				table: 'ASSOCIATION_KEYWORD_TOPIC',
				optionColumn: 'KEYWORD_ID',
				criteriaStructure: ccdAssociationKeywordTopicCriteriaStructure
			}
		},
		{
			title: '4H Import',
			customClasses: ['full-width'],
			customComponent: FourHImportComponent,
			isAssignable: true,
			depends: {
				association: 'Program Areas',
				useValues: true,
				test: (records, schema) => records.length > 0 && records.map(r => r.AREA_ID).indexOf(3) !== -1
			},
			grouping: {
				section: 'Demographic Information',
				order: 1
			}
		},
		{
			title: 'Contacts',
			description: 'Please enter the total number of contacts for the entire activity here.  You\'ll have an opportunity later to enter only the contacts you personally made.',
			schema: reportContactSchema,
			helpMessageName: 'CONTACTS_HEADER',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			optionColumnName: 'TYPE_ID',
			isAssignable: true,
			grouping: {
				section: 'Demographic Information',
				order: 2
			},
			displayAllOptions: true,
			showTotals: true,
			filter: {
				associations: [
					{
						title: 'Report Type',
						column: 'TYPE_ID',
						criteriaColumn: 'REPORT_TYPE_ID'
					}
				],
				getValues: getAssociationReportTypeContactType,
				database: 'GACOUNTS3',
				table: 'ASSOCIATION_REPORT_TYPE_CONTACT_TYPE',
				optionColumn: 'CONTACT_TYPE_ID',
				criteriaStructure: gc3AssociationReportTypeContactTypeCriteriaStructure
			}
		},
		{
			title: 'Racial Demographics',
			schema: altRacialDemographicSchema,
			helpMessageName: 'RACIAL_HEADER',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			optionColumnName: 'RACE_ID',
			isAssignable: true,
			displayAllOptions: true,
			showTotals: true,
			grouping: {
				section: 'Demographic Information',
				order: 4
			},
			depends: {
				association: 'Contacts',
				useValues: true,
				test: demographicsTest
			}
		},
		{
			title: 'Ethnic Demographics',
			schema: altEthnicDemographicSchema,
			helpMessageName: 'ETHNIC_HEADER',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			optionColumnName: 'ETHNICITY_ID',
			isAssignable: true,
			displayAllOptions: true,
			showTotals: true,
			grouping: {
				section: 'Demographic Information',
				order: 5
			},
			depends: {
				association: 'Contacts',
				useValues: true,
				test: demographicsTest
			}
		},
		{
			title: 'Residence Demographics',
			description: 'Please balance Residence Demographics to Face to Face numbers.',
			schema: residenceDemographicSchema,
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			optionColumnName: 'TYPE_ID',
			isAssignable: true,
			displayAllOptions: true,
			showTotals: true,
			grouping: {
				section: 'Demographic Information',
				order: 6
			},
			depends: {
				association: 'Report Type',
				useValues: true,
				test: (records, schema) => {
					let passes = false;
					const associationsMap = schema.associations.map(a => a.title);
					const association = schema.associations[associationsMap.indexOf('Report Type')];
					const columnsMap = association.schema.columns.map(c => c.columnName);
					const column = association.schema.columns[columnsMap.indexOf('TYPE_ID')];
					const { values } = column.constraint;
					const valuesIdMap = values.map(v => v.key);
					const valuesUsesResidenceMap = values.map(v => {
						if (v.originalValue) return v.originalValue.USES_RESIDENCE;

						 return v.USES_RESIDENCE;
					});
					records.forEach(record => {
						if (valuesUsesResidenceMap[valuesIdMap.indexOf(record.TYPE_ID)]) passes = true;
					});

					return passes;
				}
			}
		},
		{
			title: 'Target Audiences',
			description: 'Please balance Target Audience to Face-to-Face numbers.',
			customClasses: ['full-width'],
			schema: targetAudienceSchema,
			helpMessageName: 'TARGET_AUDIENCE_HEADER',
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			optionColumnName: 'TYPE_ID',
			isAssignable: true,
			displayAllOptions: true,
			showTotals: true,
			grouping: {
				section: 'Demographic Information',
				order: 7
			},
			filter: {
				associations: [
					{
						title: 'Program Areas',
						column: 'AREA_ID'
					}
				],
				getValues: getAssociationTargetAudienceProgramArea,
				optionColumn: 'AUDIENCE_ID',
				criteriaStructure: gc3TargetAudienceCriteriaStructure
			}
		},
		{
			title: 'Media Produced',
			schema: mediaProductionSchema,
			customComponent: MediaProducedComponent,

			// LocalKey: 'ID',
			// foreignKey: 'REPORT_ID',
			// associatedColumn: 'REPORT_ID',
			// isAssignable: true,
			grouping: {
				section: 'Supplemental Data',
				order: 2
			},

			// Limit: 1,
			depends: {
				association: 'Report Type',
				useValues: true,
				test: (records, schema) => {
					let passes = false;
					const associationsMap = schema.associations.map(a => a.title);
					const association = schema.associations[associationsMap.indexOf('Report Type')];
					const columnsMap = association.schema.columns.map(c => c.columnName);
					const column = association.schema.columns[columnsMap.indexOf('TYPE_ID')];
					const { values } = column.constraint;
					const valuesIdMap = values.map(v => v.key);
					const valuesUsesMediaProductionMap = values.map(v => {
						if (v.originalValue) return v.originalValue.USES_MEDIA_PRODUCTION;

						 return v.USES_MEDIA_PRODUCTION;
					});
					records.forEach(record => {
						if (valuesUsesMediaProductionMap[valuesIdMap.indexOf(record.TYPE_ID)]) passes = true;
					});

					return passes;
				}
			}
		},
		{
			title: 'Media Distributed',
			description: 'Be sure to click the "Save Row" button on each row entered to save the entry.  Otherwise the entry will not be saved.',
			schema: mediaDistributedSchema,
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			isAssignable: true,
			grouping: {
				section: 'Supplemental Data',
				order: 3
			},
			depends: {
				association: 'Report Type',
				useValues: true,
				test: (records, schema) => {
					let passes = false;
					const associationsMap = schema.associations.map(a => a.title);
					const association = schema.associations[associationsMap.indexOf('Report Type')];
					const columnsMap = association.schema.columns.map(c => c.columnName);
					const column = association.schema.columns[columnsMap.indexOf('TYPE_ID')];
					const { values } = column.constraint;
					const valuesIdMap = values.map(v => v.key);
					const valuesUsesMediaDistributedMap = values.map(v => {
						if (v.originalValue) return v.originalValue.USES_MEDIA_DISTRIBUTION;

						 return v.USES_MEDIA_DISTRIBUTION;
					});
					records.forEach(record => {
						if (valuesUsesMediaDistributedMap[valuesIdMap.indexOf(record.TYPE_ID)]) passes = true;
					});

					return passes;
				}
			}
		},
		{
			title: 'Media Reviewed',
			schema: mediaReviewSchema,
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			isAssignable: true,
			grouping: {
				section: 'Supplemental Data',
				order: 4
			},
			depends: {
				association: 'Report Type',
				useValues: true,
				test: (records, schema) => {
					let passes = false;
					const valuesIdMap = caesCache.data.gc3.reportType.map(t => t.ID);
					const valuesUsesMediaReviewMap = caesCache.data.gc3.reportType.map(t => t.USES_MEDIA_REVIEW);
					records.forEach(record => {
						if (valuesUsesMediaReviewMap[valuesIdMap.indexOf(record.TYPE_ID)]) passes = true;
					});

					return passes;
				}
			}
		},
		{
			title: 'Report Attachments',
			description: 'Attach files (optional)',
			customClasses: ['full-width'],
			foreignKey: 'REPORT_ID',
			associatedColumn: 'REPORT_ID',
			schema: associationReportAttachmentsSchema,
			isAssignable: true,
			grouping: {
				section: 'Report Attachments',
				order: 1
			}
		},
		{
			title: 'Supplemental Data',
			description: 'This set of supplemental data fields is for data pertaining to all the reported activities, not just those activities you were personally involved in.',
			customClasses: ['full-width'],
			schema: associationReportFieldSchema,
			customComponent: SupplementalDataComponent,
			helpMessageName: 'ReportSupplementalData',
			isAssignable: true,
			grouping: {
				section: 'Supplemental Data',
				order: 1
			}
		},
		{
			title: 'Collaborators',
			schema: reportPersonnelSchema,
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			associatedColumn: 'PERSONNEL_ID',
			isAssignable: true,
			grouping: {
				section: 'Sub-Reports',
				order: 1
			}
		},
		{
			title: '4H Enrollment Activities',
			schema: associationReport4HEnrollmentActivitySchema,
			localKey: 'ID',
			foreignKey: 'REPORT_ID',
			isAssignable: false,
			forDataStoreOnly: true,
			grouping: {
				section: 'Demographic Information',
				order: 1
			}
		}
	],
	subschemas: [
		{
			title: 'Sub-Report',
			schema: subReportSchema,
			customComponent: SubReportForReportComponent,
			grouping: {
				section: 'Sub-Reports',
				order: 2
			}
		}
	],
	sections: [
		{
			title: 'Main Report Information',
			order: 1,
			required: true,
			disableFlex: true
		},
		{
			title: 'Topics and Keywords',
			order: 2,
			required: true,
			depends: {
				associations: ['Program Areas', 'Report Type']
			}
		},
		{
			title: 'Demographic Information',
			order: 3,
			depends: {
				associations: ['Program Areas', 'Report Type', 'Topics']
			}
		},
		{
			title: 'Supplemental Data',
			order: 4,
			depends: {
				associations: ['Program Areas', 'Report Type', 'Topics']
			}
		},
		{
			title: 'Report Attachments',
			order: 5
		},
		{
			title: 'Sub-Reports',
			order: 6,
			required: true,
			customComponent: SubReportCollaborators,
			depends: {
				associations: ['Program Areas', 'Report Type', 'Topics']
			}
		}
	]
};

export default schema;
