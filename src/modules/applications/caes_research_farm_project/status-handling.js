/* global caesCache */

export const statusesIndexedByName = caesCache.data.crfp.status.reduce((newIndex, status) => {
	newIndex[status.NAME] = status.ID;

	return newIndex;
}, {});

export const getProjectsNextStatusId = (project, isBeingSubmittedForApproval = false) => {
	let currentStatus = isBeingSubmittedForApproval ? null : project.STATUS_ID;
	if (!currentStatus) currentStatus = statusesIndexedByName['Saved Without Submission'];
	const statusesIndexedById = caesCache.data.crfp.status.reduce((newIndex, status) => {
		newIndex[status.ID] = status.NAME;

		return newIndex;
	}, {});
	const stage = {
		null: 0,
		undefined: 0,
		'Saved Without Submission': 0,
		'Pending PI Review of Department Head Comments': 0,
		'Pending PI Review of Superintendent Comments': 0,
		'Pending PI Review of Final Site Approver Comments': 0,
		'Pending PI Review of Office of Associate Dean of Research Comments': 0,
		'Pending Superintendent Approval': 1,
		'Pending Department Head Approval': 2,
		'Pending Final Site Approver Approval': 3,
		'Pending Office of Associate Dean of Research Approval': 4,
		Approved: 5,
		Rejected: 5
	}[statusesIndexedById[currentStatus]];
	const statusMap = caesCache.data.crfp.status.reduce((map, status) => {
		if (stage < 1 && project.STATION_SUPERINTENDENT_PERSONNEL_ID !== null) map[status.ID] = statusesIndexedByName['Pending Superintendent Approval'];
		 else if (stage < 2 && project.DEPARTMENT_HEAD_PERSONNEL_ID !== null) map[status.ID] = statusesIndexedByName['Pending Department Head Approval'];
		 else if (stage < 3 && project.FINAL_SITE_APPROVER_PERSONNEL_ID !== null) map[status.ID] = statusesIndexedByName['Pending Final Site Approver Approval'];
		 else if (stage < 4 && project.OFFICE_OF_RESEARCH_PERSONNEL_ID !== null) map[status.ID] = statusesIndexedByName['Pending Office of Associate Dean of Research Approval'];
		 else if (stage < 5) map[status.ID] = statusesIndexedByName.Approved;
		 else map[status.ID] = -1;

		return map;
	}, {});

	return statusMap[currentStatus];
};

export const getProjectsRevisionStatusId = project => caesCache.data.crfp.status.map(status => {
	if (status.NAME === 'Pending Superintendent Approval') return statusesIndexedByName['Pending PI Review of Superintendent Comments'];
		 if (status.NAME === 'Pending Department Head Approval') return statusesIndexedByName['Pending PI Review of Department Head Comments'];
		 if (status.NAME === 'Pending Final Site Approver Approval') return statusesIndexedByName['Pending PI Review of Final Site Approver Comments'];
		 if (status.NAME === 'Pending Office of Associate Dean of Research Approval') return statusesIndexedByName['Pending PI Review of Office of Associate Dean of Research Comments'];

	return status;
})[caesCache.data.crfp.status.map(s => s.ID).indexOf(project.STATUS_ID)];
