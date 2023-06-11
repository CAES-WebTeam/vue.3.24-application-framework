// Globals
/* global applicationName */
/* global notify */

// Required modules
import prepareForCf from "~/modules/prepareForCf";
import request from "superagent";
import { cfToJs, jsToCf } from "~/modules/criteriaUtils";
import { getSubReportPurposeAchievements } from "./gacounts3";

const apiPrefix = "/rest/global/";

// Simple function for generating a url
export const generateUrl = (string, prefix) =>
	[prefix, string, ".json"].join("");

// Criteria Structure Fetcher
export const getCriteriaStructure = (databaseName, tablePrefix, callback) => {
	if (!tablePrefix) {
		logError(
			new Error("Cannot fetch criteria structure: table prefix is undefined")
		);

		return;
	}
	if (!databaseName) {
		logError(
			new Error("Cannot fetch criteria structure: database name is undefined")
		);

		return;
	}
	const url = `${apiPrefix}criteriaStructure.json?TablePrefix=${tablePrefix}&DatabaseName=${databaseName}`;
	request.get(url).end((err, response) => {
		// Do we need a response check-and-repair here?
		// Note that if this fetch is caught and repaired, there is no red error pop-up in the corner of Georgia Counts (even when there should be).
		// JDK 4/17/2023
		if (response.body === null) {
			response.body = JSON.parse(response.text);
		}
		callback(err, cfToJs(response.body));
	});
};

// Async Criteria Structure Fetcher
export const asyncGetCriteriaStructure = (databaseName, tablePrefix) => {
	if (!tablePrefix) {
		logError(
			new Error("Cannot fetch criteria structure: table prefix is undefined")
		);

		return;
	}
	if (!databaseName) {
		logError(
			new Error("Cannot fetch criteria structure: database name is undefined")
		);

		return;
	}
	const url = `${apiPrefix}criteriaStructure.json?TablePrefix=${tablePrefix}&DatabaseName=${databaseName}`;

	return request.get(url);
};

// Error logging function
export const logError = (err, dump = {}, trace = null) => {
	// If in development mode, log the error to the console
	if (process.env.NODE_ENV === "development") console.error(err);

	// Grab the current url
	const currentUrl = new URL(window.location);

	// Create an object that mirrors our error log table
	const errObj = {
		ID: null,
		APPLICATION_ID: 1,
		FIXED_DEVELOPMENT: false,
		FIXED_PRODUCTION: false,
		DATE_CREATED: null,
		DATE_LAST_UPDATED: null,
		BROWSER: navigator.userAgent,
		ERROR_DATETIME: new Date().toUTCString(),
		DETAIL: null,
		ERROR_DIAGNOSTICS: null,
		ERROR_CODE: null,
		EXTENDED_INFO: null,
		HTTP_REFERER: currentUrl.href,
		MAIL_TO: null,
		MESSAGE: null,
		NATIVE_ERROR_CODE: null,
		QUERY_STRING: currentUrl.search,
		REMOTE_ADDRESS: null,
		ERROR_SQLSTATE: null,
		TAG_CONTEXT: null,
		TEMPLATE: currentUrl.pathname,
		TYPE: "javascript/vue",
		SQL_STATEMENT: null,
		SESSION_DUMP: null,
		URL_DUMP: null,
		FORM_DUMP: null,
		CGI_DUMP: null,
		APPLICATION_DUMP: null,
		REQUEST_DUMP: null
	};

	// (typeof err === 'string' ? err : JSON.stringify(err, null, 2)) + (trace ? '\n' + JSON.stringify(trace, null, 2) : '')
	if (err.status) {
		let response = null;
		try {
			// This is one of the locations where a catch and repair is needed
			response = JSON.parse(err.response.text);
		} catch (e) {
			response = err.response.text;
		}
		errObj.DETAIL = `<pre>${JSON.stringify(
			{
				url: err.response.req.url,
				data: err.response.req._data,
				status: err.status,
				method: err.response.req.method,
				response
			},
			null,
			4
		)}</pre>`;
	} else {
		if (typeof err === "object")
			errObj.DETAIL = `<pre>${JSON.stringify(err, null, 4)}</pre>`;
		else errObj.DETAIL = err;

		if (dump && dump !== "") {
			errObj.APPLICATION_DUMP = JSON.stringify(dump, null, 4);
		}
	}

	// The url for the error logging endpoint
	let url = "/rest/global/logError.json";

	// Optionally provide a url param specifying the application name
	if (applicationName) url += `?applicationName=${applicationName}`;

	// Send it off!
	makePostRequest(url, prepareForCf(errObj), false);

	// Notify the user
	notify.error(
		`An error has occurred.  If this persists, please email <a href="mailto:caesweb@uga.edu">caesweb@uga.edu</a> and include the following error message:<br /><br />${err}`
	);
};

// We're having a problem in this function where a JSON call is being fetched as plaintext, which results in the response.body field being empty.
export const makeGetRequest = (url, callback) => {
	window.pendingRequests
		? ++window.pendingRequests
		: (window.pendingRequests = 1);

	// Alternate fetch method for debugging purposes
	// fetch(url, {
	// 	credentials: "include",
	// 	method: "GET",
	// 	headers: {
	// 		Accept: "application/json",
	// 		"Content-Type": "application/json"
	// 	}
	// })
	// .then(response => {
	// 	--window.pendingRequests;
	// 	const data = response.body;
	// 	if (data === null) {
	// 		console.log(url);
	// 		data=response.message;
	// 		console.log(data);
	// 	}
	// });

	request
		// The below method should really work, but for some reason browsers won't recognize it as a valid method.
		// Hence the necessity of having a repair case for when the object inexplicably comes back with content-type
		// text/plain.
		// JDK 1/27/2023
		// .setRequestHeader('Accept', 'application/json')
		.get(url)
		.end((err, response) => {
			--window.pendingRequests;
			let data = response.body;
			if (response.body === null) {
				data = JSON.parse(response.text);
			}

			if (err) callback(err);
			else if (data.Message) callback(new Error(data.Message));
			else callback(null, data);
		});
};

export const makeAsyncPostRequest = async (
	url,
	dataToSend,
	isCriteriaStructure = true
) => {
	window.pendingRequests
		? ++window.pendingRequest
		: (window.pendingRequests = 1);
	try {
		const response = await request
			.post(url)
			.send(isCriteriaStructure ? jsToCf(dataToSend) : dataToSend);
		--window.pendingRequests;
		if (response.body === null) {
			response.body = JSON.parse(response.text);
		}
		return response.body;
	} catch (err) {
		--window.pendingRequests;
		logError(err);
	}
};

export const makePostRequest = (
	url,
	dataToSend,
	callback,
	isCriteriaStructure = true
) => {
	window.pendingRequests
		? ++window.pendingRequests
		: (window.pendingRequests = 1);

	request
		.post(url)
		.send(isCriteriaStructure ? jsToCf(dataToSend) : dataToSend)
		.end((err, response) => {
			--window.pendingRequests;
			var data = response.body;
			// Another location for catch and repair
			if (response.body === null) {
				try {
					data = JSON.parse(response.text);
				} catch {
					data = response.text;
				}
			}
			if (data === null) {
			}
			if (err || !data) callback(err || new Error("No data returned"));
			else if (data.Message) callback(new Error(data.Message));
			else callback(null, data);
		});
};
