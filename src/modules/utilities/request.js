/* global fetch */

// Generic request function
const makeRequest = (url, options, callback) => {
	fetch(url, options)
		.then(response => response.json())
		.then(response => {
			callback(null, response);
		});
};

// Options constructor
const getOptions = (method, data) => ({
	body: JSON.stringify(data),
	credentials: 'cors',
	headers: {
		'content-type': 'application/json'
	},
	method
});

const request = {
	get: (url, callback) => {
		makeRequest(url, {}, callback);
	},
	post: (url, data, callback) => {
		const options = getOptions('POST', data);
		makeRequest(url, options, callback);
	},
	put: (url, data, callback) => {
		const options = getOptions('PUT', data);
		makeRequest(url, options, callback);
	},
	delete: (url, data, callback) => {
		const options = getOptions('DELETE', data);
		makeRequest(url, options, callback);
	}
};

export default request;
