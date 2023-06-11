import request from 'superagent';
import {
	generateUrl,
	logError,
	makeAsyncPostRequest
} from '~/modules/caesdb';

const apiPrefix = '/rest/caesresearchfarmproject/';

const failureMessage = { success: false };

export const getDepartmentHeadCollegeId = async personnelId => {
	window.pendingRequests ? ++window.pendingRequests : window.pendingRequests = 1;
	if (!personnelId) {
		logError(new Error('Cannot get department head: No personnel ID specified.'));

		return;
	}
	const url = `${apiPrefix}departmentsFromPersonnelId.json?personnelId=${personnelId}`;
	try {
		const requestContents = await request.get(url);
		let departments = [];
		if (requestContents.body === null) {
			departments = JSON.parse(requestContents.text);
		} else {
			departments = requestContents.body;
		}
		// const departments = (await request.get(url)).body;
		if (!departments || departments.length < 1) throw new Error('No departments found');
		if (!departments[0].DEPTHEAD) throw new Error('No department head ID found');
		--window.pendingRequests;

		return departments[0].DEPTHEAD;
	} catch (err) {
		--window.pendingRequests;
		logError(err);
	}
};

export const deleteFile = async (projectId, columnName, fileName) => {
	try {
		const url = generateUrl('deleteFile', apiPrefix);
		const data = await makeAsyncPostRequest(url, { projectId, columnName, fileName });

		return { success: data.SUCCESS, messages: data.MESSAGES };
	} catch (err) {
		return { success: false, messages: err };
	}
};

export const deleteProject = async projectId => {
	try {
		const url = generateUrl('deleteProject', apiPrefix);
		const data = await makeAsyncPostRequest(url, { projectId });

		return { success: true, data };
	} catch (err) {
		return { success: false, err };
	}
};

export const getProject = async (criteriaStructure, callback) => {
	try {
		const url = generateUrl('project', apiPrefix);
		const data = await makeAsyncPostRequest(url, criteriaStructure);
		callback(null, data);
	} catch (err) {
		callback(err);
	}
};

export const getImportantDates = async criteriaStructure => {
	try {
		const url = generateUrl('importantDates', apiPrefix);
		const data = await makeAsyncPostRequest(url, criteriaStructure);

		return { success: true, data };
	} catch (err) {
		return { success: false, err };
	}
};

export const getSupplementalAnimalInfo = async criteriaStructure => {
	try {
		const url = generateUrl('supplementalAnimalInfo', apiPrefix);
		const data = await makeAsyncPostRequest(url, criteriaStructure);

		return { success: true, data };
	} catch (err) {
		return { success: false, err };
	}
};

export const getSupplementalPlantInfo = async criteriaStructure => {
	try {
		const url = generateUrl('supplementalPlantInfo', apiPrefix);
		const data = await makeAsyncPostRequest(url, criteriaStructure);

		return { success: true, data };
	} catch (err) {
		return { success: false, err };
	}
};

export const saveProject = async (projectBlob, saveOnly = false) => {
	window.pendingRequests ? ++window.pendingRequests : window.pendingRequests = 1;
	try {
		const url = generateUrl('saveProject', apiPrefix);

		// Const data = await makeAsyncPostRequest(url, project, false);
		const data = await request
			.post(url)
			.attach('TREATMENT_LIST_ATTACHMENT_PATH', projectBlob.project.TREATMENT_LIST_ATTACHMENT_PATH instanceof File ? projectBlob.project.TREATMENT_LIST_ATTACHMENT_PATH : null)
			.attach('PLOT_MAP_ATTACHMENT_PATH', projectBlob.project.PLOT_MAP_ATTACHMENT_PATH instanceof File ? projectBlob.project.PLOT_MAP_ATTACHMENT_PATH : null)
			.attach('CALENDAR_ATTACHMENT_PATH', projectBlob.project.CALENDAR_ATTACHMENT_PATH instanceof File ? projectBlob.project.CALENDAR_ATTACHMENT_PATH : null)
			.field('projectBlob', JSON.stringify(projectBlob))
			.field('saveOnly', JSON.stringify(saveOnly));
		--window.pendingRequests;

		return data;
	} catch (err) {
		--window.pendingRequests;
		logError(err);

		return failureMessage;
	}
};

export const addComment = async (projectId, statusId, columnName, comment = '') => {
	try {
		const url = generateUrl('addComment', apiPrefix);
		const data = await makeAsyncPostRequest(url, { projectId, statusId, columnName, comment }, false);

		return data;
	} catch (err) {
		logError(err);

		return failureMessage;
	}
};

export const saveResultsFile = async (projectBlob) => {
	window.pendingRequests ? ++window.pendingRequests : window.pendingRequests = 1;
	try {
		const url = generateUrl('saveResultsFile', apiPrefix);

		// Const data = await makeAsyncPostRequest(url, project, false);
		let data = await request
			.post(url)
			.attach('RESULTS_FILE', projectBlob.project.RESULTS_FILE instanceof File ? projectBlob.project.RESULTS_FILE : null)
			.field('projectBlob', JSON.stringify(projectBlob))
		--window.pendingRequests;

		// HTTP catch and repair JDK 4/21/2023
		if (data.body === null) {
			data.body = JSON.parse(data.text);
		}

		return data;
	} catch (err) {
		--window.pendingRequests;
		logError(err);

		return failureMessage;
	}
};