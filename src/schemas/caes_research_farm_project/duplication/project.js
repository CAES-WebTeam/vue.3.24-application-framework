const projectDuplication = {
	title: "Research Farm Project Duplication",
	instruction: `
		Please select below which sections you would like to copy into your new
		project.
	`.trim(),
	sections: {
		Title: {
			duplicate: true,
			areas: {
				columns: ["TITLE"]
			}
		},
		"Participating Research Farm": {
			duplicate: true,
			areas: {
				columns: ["PARTICIPATING_RESEARCH_FARM_ID"]
			}
		},
		Dates: {
			duplicate: true,
			areas: {
				columns: ["START_DATE", "END_DATE"]
			}
		},
		"Principal Investigator": {
			duplicate: true,
			areas: {
				columns: [
					"PI_PERSONNEL_ID",
					"PI_FIRST_NAME",
					"PI_LAST_NAME",
					"PI_EMAIL",
					"PI_PHONE",
					"PI_ORGANIZATION",
					"PI_DEPARTMENT"
				]
			}
		},
		"Co Principal Investigator": {
			duplicate: true,
			areas: {
				columns: [
					"CI_PERSONNEL_ID",
					"PI_FIRST_NAME",
					"PI_LAST_NAME",
					"PI_EMAIL",
					"PI_PHONE",
					"PI_ORGANIZATION",
					"PI_DEPARTMENT"
				]
			}
		},
		"Secondary Contact": {
			duplicate: true,
			areas: {
				columns: [
					"SECONDARY_CONTACT_PERSONNEL_ID",
					"SECONDARY_CONTACT_FIRST_NAME",
					"SECONDARY_CONTACT_LAST_NAME",
					"SECONDARY_CONTACT_EMAIL",
					"SECONDARY_CONTACT_PHONE",
					"SECONDARY_CONTACT_ORGANIZATION",
					"SECONDARY_CONTACT_DEPARTMENT"
				]
			}
		},
		"Commodity, Discipline, and Areas to Which the Project Pertains": {
			duplicate: true,
			areas: {
				columns: [
					"COMMODITY_ID",
					"COMMODITY_OTHER",
					"DISCIPLINE_ID",
					"DISCIPLINE_OTHER",
					"PROJECT_AREA"
				]
			}
		},
		"Summary of Project": {
			duplicate: true,
			areas: {
				columns: ["RATIONALE", "OBJECTIVES_SUMMARY"]
			}
		},
		Attachments: {
			duplicate: true,
			areas: {
				columns: [
					"TREATMENT_LIST_ATTACHMENT_PATH",
					"PLOT_MAP_ATTACHMENT_PATH",
					"CALENDAR_ATTACHMENT_PATH"
				]
			}
		},
		"Plant Science Project Information": {
			duplicate: true,
			areas: {
				columns: ["INVOLVES_PLANTS"],
				associations: ["supplementalPlantInformation"]
			}
		},
		"Animal Science Project Information": {
			duplicate: true,
			areas: {
				columns: ["INVOLVES_ANIMALS"],
				associations: ["supplementalAnimalInformation"]
			}
		},
		"Additional Responsibilities and Funding": {
			duplicate: true,
			areas: {
				columns: [
					"SAFETY_REQUIREMENTS",
					"FINANCIAL_SUPPORT_AVAILABLE",
					"RESULTS_LOCATION"
				]
			}
		}
	}
};

export default projectDuplication;
