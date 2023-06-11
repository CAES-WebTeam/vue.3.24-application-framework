/* global caesCache */
/* global activeUserId */
import CaesPersonnelDetails from "~/views/custom/caes_research_farm_project/CaesPersonnelDetails";
import FinancialSupport from "~/views/custom/caes_research_farm_project/FinancialSupport";
import ResultsFile from "~/views/custom/caes_research_farm_project/ResultsFile";
import RoutingAndApproval from "~/views/custom/caes_research_farm_project/RoutingAndApproval";
import SupplementalAnimalInfo from "~/views/custom/caes_research_farm_project/SupplementalAnimalInfo";
import SupplementalPlantInfo from "~/views/custom/caes_research_farm_project/SupplementalPlantInfo";
import supplementalAnimalInfoSchema from "~/schemas/caes_research_farm_project/supplemental_animal_info";
import supplementalPlantInfoSchema from "~/schemas/caes_research_farm_project/supplemental_plant_info";
import RADIO_OPTIONS_BOOLEAN from "~/globals/radio-options-boolean";
import {
	deleteFile,
	getDepartmentHeadCollegeId,
	getProject
} from "~/modules/caesdb/caes_research_farm_project";
import { logError } from "~/modules/caesdb";

const nullTest = val => val === null || val === "";
const notNullTest = val => !nullTest(val);

const genericCommentFieldDescription = `
	Please indicate whether this project should be approved or not.  Any
	feedback you have entered in the comments field will be sent to the
	PI / project originator.
`.trim();

const getResearchFarmDependencyTest = key => val => {
	if (!val) return false;
	const farmIndex = caesCache.data.crfp.researchFarm
		.map(f => f.ID)
		.indexOf(val);
	if (farmIndex === -1) return false;
	const farm = caesCache.data.crfp.researchFarm[farmIndex];

	return farm[key] !== null;
};

const getResearchFarmDependentValueFn = key => store => {
	const farmId = store.state.project.PARTICIPATING_RESEARCH_FARM_ID;
	if (nullTest(farmId)) return null;
	const farmIndex = caesCache.data.crfp.researchFarm
		.map(f => f.ID)
		.indexOf(farmId);
	if (farmIndex === -1) return null;

	return caesCache.data.crfp.researchFarm[farmIndex][key];
};

const schema = {
	title: "Project",
	databaseName: "CAES_RESEARCH_FARM_PROJECT",
	tablePrefix: "CRFP_PROJECT",
	criteria: {
		string: "criteria_ID_eq"
	},
	fetchExisting: getProject,
	columns: [
		{
			columnName: "ID",
			prettyName: "Project Number",
			type: "int",
			immutable: true,
			automated: true,
			showOnView: true,
			grouping: {
				section: "General Information",
				order: 1
			}
		},
		{
			columnName: "ORIGINATOR_ID",
			type: "int",
			default: activeUserId,
			immutable: true,
			automated: true,
			grouping: {
				section: "General Information",
				order: 3
			}
		},
		{
			columnName: "TITLE",
			type: "nvarchar",
			required: true,
			grouping: {
				section: "General Information",
				order: 1
			},
			customClasses: ["medium"]
		},
		{
			columnName: "PARTICIPATING_RESEARCH_FARM_ID",
			prettyName: "Participating Research Farm",
			type: "int",
			required: true,
			constraint: {
				foreignKey: "ID",
				foreignLabel: "NAME",
				values: caesCache.data.crfp.researchFarm
			},
			grouping: {
				section: "General Information",
				order: 3
			}
		},
		{
			columnName: "START_DATE",
			type: "datetime",
			required: true,
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "END_DATE",
			type: "datetime",
			required: true,
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PI_PERSONNEL_ID",
			prettyName: "CAES Principal Investigator",
			type: "int",
			caveat:
				"Required.  If not populated, a non-CAES Principal Investigator must be entered.",
			constraint: {
				values: caesCache.data.crfp.principleInvestigators,
				foreignKey: "PERSONNEL_ID",
				foreignLabel: "FULL_NAME_LAST_FIRST"
			},
			allowNullOption: true,
			grouping: {
				section: "General Information",
				order: 3
			},
			customComponentForViewMode: {
				component: CaesPersonnelDetails,
				options: { isPrinciple: true, isCoInvestigator: false }
			}
		},

		//Added by Scott 05/05/2023
		{
			columnName: "CI_PERSONNEL_ID",
			prettyName: "CAES Co-Principal Investigator",
			type: "int",
			caveat: "Optional. Co-Principal Investigator must be CAES personnel.",
			constraint: {
				values: caesCache.data.crfp.principleInvestigators,
				foreignKey: "PERSONNEL_ID",
				foreignLabel: "FULL_NAME_LAST_FIRST"
			},
			allowNullOption: true,
			grouping: {
				section: "General Information",
				order: 3
			},
			customComponentForViewMode: {
				component: CaesPersonnelDetails,
				options: { isPrinciple: false, isCoInvestigator: true }
			},
			//Added by Scott 05/16/2023
			depends: {
				column: "PI_PERSONNEL_ID",
				test: value => value
			}
		},

		{
			columnName: "SECONDARY_CONTACT_PERSONNEL_ID",
			prettyName: "CAES Secondary Contact",
			type: "int",
			constraint: {
				values: caesCache.data.crfp.secondaryContacts,
				foreignKey: "PERSONNEL_ID",
				foreignLabel: "FULL_NAME_LAST_FIRST"
			},
			allowNullOption: true,
			grouping: {
				section: "General Information",
				order: 3
			},
			customComponentForViewMode: {
				component: CaesPersonnelDetails,
				options: { isPrinciple: false }
			}
		},
		{
			columnName: "PI_FIRST_NAME",
			prettyName: "First Name",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PI_LAST_NAME",
			prettyName: "Last Name",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PI_EMAIL",
			prettyName: "Email Address",
			placeholder: "name@domain.com",
			type: "nvarchar",
			inputType: "email",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PI_PHONE",
			prettyName: "Phone Number",
			placeholder: "(xxx) xxx-xxxx",
			type: "nvarchar",
			inputType: "tel",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PI_DEPARTMENT",
			prettyName: "Department Name",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PI_ORGANIZATION",
			prettyName: "Organization",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "SECONDARY_CONTACT_FIRST_NAME",
			prettyName: "First Name",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "SECONDARY_CONTACT_LAST_NAME",
			prettyName: "Last Name",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "SECONDARY_CONTACT_EMAIL",
			prettyName: "Email Address",
			placeholder: "name@domain.com",
			type: "nvarchar",
			inputType: "email",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "SECONDARY_CONTACT_PHONE",
			prettyName: "Phone Number",
			placeholder: "(xxx) xxx-xxxx",
			type: "nvarchar",
			inputType: "tel",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "SECONDARY_CONTACT_DEPARTMENT",
			prettyName: "Department Name",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "SECONDARY_CONTACT_ORGANIZATION",
			prettyName: "Organization",
			type: "nvarchar",
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "COMMODITY_ID",
			prettyName: "Commodity",
			type: "int",
			required: true,
			constraint: {
				values: caesCache.data.crfp.commodity,
				foreignKey: "ID",
				foreignLabel: "LABEL"
			},
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "COMMODITY_OTHER",
			prettyName: "Other/Secondary Commodity",
			type: "nvarchar",
			required: false,
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		// 3/12/21 RHT  Just before pushing to prod, Dr. Stougaard decided against having this field.
		/*{
			columnName: 'INVOLVES_PRECISION_AGRICULTURE',
			type: 'bit',
			required: true,
			inputType: 'radio',
			default: false,
			constraint: { ...RADIO_OPTIONS_BOOLEAN },
			grouping: {
				section: 'General Information',
				order: 3
			},
			customClasses: ['inline']
		},*/
		{
			columnName: "DISCIPLINE_ID",
			prettyName: "Discipline",
			type: "int",
			required: true,
			constraint: {
				values: caesCache.data.crfp.discipline,
				foreignKey: "ID",
				foreignLabel: "LABEL"
			},
			grouping: {
				section: "General Information",
				order: 3
			},
			customClasses: ["inline"]
		},
		{
			columnName: "DISCIPLINE_OTHER",
			prettyName: "Other/Secondary Discipline",
			type: "nvarchar",
			required: false,
			grouping: {
				section: "General Information",
				order: 4
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PROJECT_AREA",
			prettyName: "Primary Area to Which the Project Pertains",
			type: "nvarchar",
			inputType: "radio",
			required: true,
			grouping: {
				section: "General Information",
				order: 3
			},
			constraint: {
				foreignKey: "name",
				foreignLabel: "name",
				values: [
					{ name: "Research (Replicated Treatments)" },
					{ name: "Extension (Unreplicated Treatments)" },
					{ name: "Teaching" }
				]
			}
		},
		{
			columnName: "RATIONALE",
			prettyName: "Justification",
			type: "nvarchar",
			inputType: "textarea",
			maxlength: 1250,
			caveat: "Maximum of 250 words",
			required: true,
			grouping: {
				section: "Summary of Project",
				order: 1
			},
			customClasses: ["full"]
		},
		{
			columnName: "OBJECTIVES_SUMMARY",
			prettyName: "Objectives",
			type: "nvarchar",
			inputType: "textarea",
			maxlength: 1250,
			caveat: "Maximum of 250 words",
			required: true,
			grouping: {
				section: "Summary of Project",
				order: 2
			},
			customClasses: ["full"]
		},

		// {
		// 	columnName: 'PLAN_OF_WORK',
		// 	type: 'nvarchar',
		// 	inputType: 'textarea',
		// 	required: true,
		// 	grouping: {
		// 		section: 'Scientist and Station Responsibilities',
		// 		order: 1
		// 	}
		// },
		{
			columnName: "TREATMENT_LIST_ATTACHMENT_PATH",
			prettyName: "Treatment List",
			type: "nvarchar",
			inputType: "file",
			deleteFile: (projectId, fileName) =>
				deleteFile(projectId, "TREATMENT_LIST_ATTACHMENT_PATH", fileName),
			grouping: {
				section: "Scientist and Station Responsibilities",
				order: 1
			},
			customClasses: ["inline"]
		},
		{
			columnName: "PLOT_MAP_ATTACHMENT_PATH",
			prettyName: "Plot Map",
			type: "nvarchar",
			inputType: "file",
			deleteFile: (projectId, fileName) =>
				deleteFile(projectId, "PLOT_MAP_ATTACHMENT_PATH", fileName),
			grouping: {
				section: "Scientist and Station Responsibilities",
				order: 1
			},
			customClasses: ["inline"]
		},
		{
			columnName: "CALENDAR_ATTACHMENT_PATH",
			prettyName: "Calendar",
			type: "nvarchar",
			inputType: "file",
			deleteFile: (projectId, fileName) =>
				deleteFile(projectId, "CALENDAR_ATTACHMENT_PATH", fileName),
			grouping: {
				section: "Scientist and Station Responsibilities",
				order: 1
			},
			customClasses: ["inline"]
		},
		{
			columnName: "INVOLVES_PLANTS",
			prettyName: "Plants",
			type: "bit",
			default: false,
			grouping: {
				section: "Scientist and Station Responsibilities",
				order: 1
			},
			customClasses: ["inline"]
		},
		{
			columnName: "INVOLVES_ANIMALS",
			prettyName: "Animals",
			type: "bit",
			default: false,
			grouping: {
				section: "Scientist and Station Responsibilities",
				order: 1
			},
			customClasses: ["inline"]
		},
		{
			columnName: "SAFETY_REQUIREMENTS",
			prettyName: "Safety Precautions",
			type: "nvarchar",
			inputType: "textarea",
			grouping: {
				section: "Additional Responsibilities and Funding",
				order: 1
			},
			customClasses: ["full"]
		},

		// {
		// 	columnName: 'FEDERAL_FUNDING_SOURCE',
		// 	prettyName: 'Federal',
		// 	type: 'nvarchar',
		// 	grouping: {
		// 		section: 'Additional Responsibilities and Funding',
		// 		order: 1
		// 	},
		// 	customClasses: [ 'inline' ]
		// },
		// {
		// 	columnName: 'STATE_FUNDING_SOURCE',
		// 	prettyName: 'State',
		// 	type: 'nvarchar',
		// 	grouping: {
		// 		section: 'Additional Responsibilities and Funding',
		// 		order: 1
		// 	},
		// 	customClasses: [ 'inline' ]
		// },
		// {
		// 	columnName: 'COMMODITY_FUNDING_SOURCE',
		// 	prettyName: 'Commodity',
		// 	type: 'nvarchar',
		// 	grouping: {
		// 		section: 'Additional Responsibilities and Funding',
		// 		order: 1
		// 	},
		// 	customClasses: [ 'inline' ]
		// },
		// {
		// 	columnName: 'OTHER_FUNDING_SOURCE',
		// 	prettyName: 'Other',
		// 	type: 'nvarchar',
		// 	grouping: {
		// 		section: 'Additional Responsibilities and Funding',
		// 		order: 1
		// 	},
		// 	customClasses: [ 'inline' ]
		// },
		{
			columnName: "FINANCIAL_SUPPORT_AVAILABLE",
			prettyName: "Financial Support Available for Project",
			description:
				"Please enter the dollar amount (cash or value of in-kind contributions) of funding available for this project.",
			type: "int",
			required: true,
			default: 0,
			grouping: {
				section: "Additional Responsibilities and Funding",
				order: 1
			},
			customComponent: FinancialSupport
		},
		{
			columnName: "RESULTS_LOCATION",
			prettyName: "Location/site where superintendent can access results",
			type: "nvarchar",
			grouping: {
				section: "Additional Responsibilities and Funding",
				order: 1
			},
			customClasses: ["is-extra-wide"]
		},
		{
			columnName: "RESULTS_FILE",
			prettyName: "Results File",
			type: "nvarchar",
			inputType: "file",
			deleteFile: (projectId, fileName) =>
				deleteFile(projectId, "RESULTS_FILE", fileName),
			grouping: {
				section: "Additional Responsibilities and Funding",
				order: 1
			},
			customComponent: ResultsFile
		},
		{
			columnName: "STATION_SUPERINTENDENT_PERSONNEL_ID",
			prettyName: "Station Superintendent",
			displayModeColumnName: "STATION_SUPERINTENDENT_DISPLAY_NAME",
			type: "int",
			immutable: true,
			getDependentValue: getResearchFarmDependentValueFn(
				"SUPERINTENDENT_PERSONNEL_ID"
			),
			constraint: {
				values: caesCache.data.crfp.superintendents,
				foreignKey: "PERSONNEL_ID",
				foreignLabel: "DISPLAY_NAME"
			},
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			depends: {
				column: "PARTICIPATING_RESEARCH_FARM_ID",
				test: getResearchFarmDependencyTest("SUPERINTENDENT_PERSONNEL_ID")
			}
		},
		{
			columnName: "STATION_SUPERINTENDENT_DISPLAY_NAME",
			//pseudo column to store supt name, needs for retired supt
			prettyName: "Station Superintendent",
			type: "hidden",
			immutable: true,
			grouping: {
				section: "Routing and Approval",
				order: 1
			}
		},
		{
			columnName: "SUPERINTENDENT_COMMENTS",
			type: "nvarchar",
			inputType: "textarea",
			description: genericCommentFieldDescription,
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			depends: {
				column: "PARTICIPATING_RESEARCH_FARM_ID",
				test: getResearchFarmDependencyTest("SUPERINTENDENT_PERSONNEL_ID")
			},
			extra: {
				dateColumn: "SUPERINTENDENT_APPROVAL_DATE",
				needsApprovalButtons: true,
				personnelColumn: "STATION_SUPERINTENDENT_PERSONNEL_ID",
				status: "Pending Superintendent Approval"
			}
		},
		{
			columnName: "SUPERINTENDENT_APPROVAL_DATE",
			type: "datetime",
			automated: true,
			grouping: {
				section: "Routing and Approval",
				order: 1
			}
		},
		{
			columnName: "DEPARTMENT_HEAD_PERSONNEL_ID",
			prettyName: "Department Head",
			type: "int",
			immutable: true,
			constraint: {
				values: caesCache.data.crfp.departmentHeads,
				foreignKey: "PERSONNEL_ID",
				foreignLabel: "DISPLAY_NAME"
			},
			getDependentValue: async store => {
				const piPersonnelId = store.state.project.PI_PERSONNEL_ID;
				if (nullTest(piPersonnelId)) return null;
				try {
					const dHeadId = await getDepartmentHeadCollegeId(piPersonnelId);
					const dHeadIndex = caesCache.data.crfp.departmentHeads
						.map(h => h.COLLEGE_ID)
						.indexOf(dHeadId);
					if (dHeadIndex === -1) return;

					return caesCache.data.crfp.departmentHeads[dHeadIndex].PERSONNEL_ID;
				} catch (err) {
					logError(err);
				}
			},
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			depends: {
				column: "PI_PERSONNEL_ID",
				test: notNullTest
			}
		},
		{
			columnName: "DEPARTMENT_HEAD_COMMENTS",
			type: "nvarchar",
			inputType: "textarea",
			description: genericCommentFieldDescription,
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			depends: {
				column: "PI_PERSONNEL_ID",
				test: notNullTest
			},
			extra: {
				dateColumn: "DEPARTMENT_HEAD_APPROVAL_DATE",
				needsApprovalButtons: true,
				personnelColumn: "DEPARTMENT_HEAD_PERSONNEL_ID",
				status: "Pending Department Head Approval"
			}
		},
		{
			columnName: "DEPARTMENT_HEAD_APPROVAL_DATE",
			type: "datetime",
			automated: true,
			grouping: {
				section: "Routing and Approval",
				order: 1
			}
		},
		{
			columnName: "FINAL_SITE_APPROVER_PERSONNEL_ID",
			prettyName: "Final Site Approver",
			type: "int",
			immutable: true,
			constraint: {
				values: caesCache.data.crfp.finalSiteApprovers,
				foreignKey: "PERSONNEL_ID",
				foreignLabel: "DISPLAY_NAME"
			},
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			getDependentValue: getResearchFarmDependentValueFn(
				"FINAL_SITE_APPROVER_PERSONNEL_ID"
			),
			depends: {
				column: "PARTICIPATING_RESEARCH_FARM_ID",
				test: getResearchFarmDependencyTest("FINAL_SITE_APPROVER_PERSONNEL_ID")
			}
		},
		{
			columnName: "FINAL_SITE_APPROVER_COMMENTS",
			type: "nvarchar",
			inputType: "textarea",
			description: genericCommentFieldDescription,
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			depends: {
				column: "PARTICIPATING_RESEARCH_FARM_ID",
				test: getResearchFarmDependencyTest("FINAL_SITE_APPROVER_PERSONNEL_ID")
			},
			extra: {
				dateColumn: "FINAL_SITE_APPROVER_APPROVAL_DATE",
				needsApprovalButtons: true,
				personnelColumn: "FINAL_SITE_APPROVER_PERSONNEL_ID",
				status: "Pending Final Site Approver Approval"
			}
		},
		{
			columnName: "FINAL_SITE_APPROVER_APPROVAL_DATE",
			type: "datetime",
			automated: true,
			grouping: {
				section: "Routing and Approval",
				order: 1
			}
		},
		{
			columnName: "OFFICE_OF_RESEARCH_PERSONNEL_ID",
			prettyName: "Office of Research",
			type: "int",
			immutable: true,
			constraint: {
				values: caesCache.data.crfp.officeOfResearchApprovers,
				foreignKey: "PERSONNEL_ID",
				foreignLabel: "DISPLAY_NAME"
			},
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			getDependentValue: getResearchFarmDependentValueFn(
				"OFFICE_OF_RESEARCH_APPROVER_PERSONNEL_ID"
			),
			depends: {
				column: "PARTICIPATING_RESEARCH_FARM_ID",
				test: getResearchFarmDependencyTest(
					"OFFICE_OF_RESEARCH_APPROVER_PERSONNEL_ID"
				)
			}
		},
		{
			columnName: "OFFICE_OF_RESEARCH_COMMENTS",
			type: "nvarchar",
			inputType: "textarea",
			description: genericCommentFieldDescription,
			grouping: {
				section: "Routing and Approval",
				order: 1
			},
			depends: {
				column: "PARTICIPATING_RESEARCH_FARM_ID",
				test: getResearchFarmDependencyTest(
					"OFFICE_OF_RESEARCH_APPROVER_PERSONNEL_ID"
				)
			},
			extra: {
				dateColumn: "OFFICE_OF_RESEARCH_APPROVAL_DATE",
				needsApprovalButtons: true,
				personnelColumn: "OFFICE_OF_RESEARCH_PERSONNEL_ID",
				status: "Pending Office of Associate Dean of Research Approval"
			}
		},
		{
			columnName: "OFFICE_OF_RESEARCH_APPROVAL_DATE",
			type: "datetime",
			automated: true,
			grouping: {
				section: "Routing and Approval",
				order: 1
			}
		},
		{
			columnName: "STATUS_ID",
			prettyName: "Status",
			type: "int",
			automated: true,
			showOnView: true,
			grouping: {
				section: "General Information",
				order: 2
			},
			constraint: {
				values: caesCache.data.crfp.status,
				foreignKey: "ID",
				foreignLabel: "NAME"
			}
		},
		{
			columnName: "DATE_UPDATED",
			type: "datetime",
			automated: true,
			grouping: {
				section: "Routing and Approval",
				order: 1
			}
		}
	],
	associations: [
		{
			title: "Supplemental Plant Information",
			schema: supplementalPlantInfoSchema,
			customComponent: SupplementalPlantInfo,
			localKey: "ID",
			customClasses: ["full-width"],

			// ForeignKey: 'PROJECT_ID',
			associatedColumn: "PROJECT_ID",

			// IsAssignable: true,
			grouping: {
				section: "Scientist and Station Responsibilities",
				order: 2
			},
			depends: {
				column: "INVOLVES_PLANTS",
				test(val) {
					return val === true;
				}
			}
		},
		{
			title: "Supplemental Animal Information",
			schema: supplementalAnimalInfoSchema,
			customComponent: SupplementalAnimalInfo,
			localKey: "ID",
			customClasses: ["full-width"],
			associatedColumn: "PROJECT_ID",
			grouping: {
				section: "Scientist and Station Responsibilities",
				order: 3
			},
			depends: {
				column: "INVOLVES_ANIMALS",
				test(val) {
					return val === true;
				}
			}
		}
	],
	subschemas: [],
	sections: [
		{
			title: "General Information",
			order: 1,
			disableFlex: {
				modes: ["view"]
			},
			fieldsets: [
				{
					title: "Dates",
					order: 3,
					columns: ["START_DATE", "END_DATE"]
				},
				{
					title: "Non-CAES Principal Investigator",
					order: 3,
					caveat: "Required if CAES Principal Investigator is not selected.",
					columns: [
						"PI_FIRST_NAME",
						"PI_LAST_NAME",
						"PI_EMAIL",
						"PI_PHONE",
						"PI_DEPARTMENT",
						"PI_ORGANIZATION"
					],
					depends: {
						column: "PI_PERSONNEL_ID",
						test: nullTest
					}
				},
				{
					title: "Non-CAES Secondary Contact",
					order: 3,
					columns: [
						"SECONDARY_CONTACT_FIRST_NAME",
						"SECONDARY_CONTACT_LAST_NAME",
						"SECONDARY_CONTACT_EMAIL",
						"SECONDARY_CONTACT_PHONE",
						"SECONDARY_CONTACT_DEPARTMENT",
						"SECONDARY_CONTACT_ORGANIZATION"
					],
					depends: {
						column: "SECONDARY_CONTACT_PERSONNEL_ID",
						test: nullTest
					}
				},
				{
					title: "Commodity/Discipline",
					order: 3,
					columns: [
						"COMMODITY_ID",
						"COMMODITY_OTHER",
						//'INVOLVES_PRECISION_AGRICULTURE',
						"DISCIPLINE_ID",
						"DISCIPLINE_OTHER"
					]
				}
			]
		},
		{
			title: "Summary of Project",
			order: 2
		},
		{
			title: "Scientist and Station Responsibilities",
			order: 3,
			fieldsets: [
				{
					title: "Attachments",
					columns: [
						"TREATMENT_LIST_ATTACHMENT_PATH",
						"PLOT_MAP_ATTACHMENT_PATH",
						"CALENDAR_ATTACHMENT_PATH"
					]
				},
				{
					title: "Project Involves Plants/Animals",
					description: `Use the checkboxes below to indicate plant or animal
					project (if "animal" or "plants and animals" is chosen, an AUP number
					must be entered in order for the form to send.)`,
					columns: ["INVOLVES_PLANTS", "INVOLVES_ANIMALS"],
					required: true
				}
			]
		},
		{
			title: "Additional Responsibilities and Funding",
			order: 4

			// Fieldsets: [
			// 	{
			// 		title: 'Specify Funding Agencies',
			// 		required: true,
			// 		columns: [
			// 			'FEDERAL_FUNDING_SOURCE',
			// 			'STATE_FUNDING_SOURCE',
			// 			'COMMODITY_FUNDING_SOURCE',
			// 			'OTHER_FUNDING_SOURCE'
			// 		]
			// 	}
			// ]
		},
		{
			title: "Routing and Approval",
			order: 5,
			depends: {
				columns: ["PARTICIPATING_RESEARCH_FARM_ID"]
			},
			customComponent: RoutingAndApproval
		}
	]
};

export default schema;
