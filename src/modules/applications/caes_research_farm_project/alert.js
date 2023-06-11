/* global swal */
import { logError } from '~/modules/caesdb';

const red = '#6c3129';
const blue = '#004e60';

const defaultOptions = { confirmButtonColor: blue };
const warnOptions = { confirmButtonColor: red, cancelButtonColor: blue };

export default {
	failedCommentSubmission: (title, messages) => {
		swal({
			...defaultOptions,
			type: 'error',
			title: 'Oops!',
			html: `
				<p>
					We were unable to submit your comments, and the ${title} status has
					not been changed due to the following issues:
				</p>
				<div style="text-align: left;">
					${messages}
				</div>
			`.trim()
		});
	},
	failedDelete: (title, messages) => {
		swal({
			...defaultOptions,
			type: 'error',
			title: 'Oops!',
			html: `
				<p>
					We were unable to delete the ${title} due to the following issues:
				</p>
				<div style="text-align: left;">
					${messages}
				</div>
			`.trim()
		});
	},
	failedReject: (title, messages) => {
		swal({
			...defaultOptions,
			type: 'error',
			title: 'Oops!',
			html: `
				<p>
					We were unable to mark this ${title}
					as rejected due to the following issues:
				</p>
				<div style="text-align: left;">
					${messages}
				</div>
			`.trim()
		});
	},
	failedResultsFileUpload: (title, messages) => {
		swal({
			...defaultOptions,
			type: 'error',
			title: 'Oops!',
			html: `
				<p>
					We were unable to upload the results file for this ${title}.
				</p>
				<div style="text-align: left;">
					${messages}
				</div>
			`.trim()
		});
	},
	failedReturnForReview: (title, messages) => {
		swal({
			...defaultOptions,
			type: 'error',
			title: 'Oops!',
			html: `
				<p>
					This ${title} was unable to be returned to the PI for review due
					to the following issues:
				</p>
				<div style="text-align: left;">
					${messages}
				</div>
			`.trim()
		});
	},
	failedSave: (title, messages, isNew = true) => {
		swal({
			...defaultOptions,
			type: 'error',
			title: 'Oops!',
			html: `
				<p>
					Your ${isNew ? `${title} was` : 'changes were'}
					unable to be saved due to the following issues:
				</p>
				<div style="text-align: left;">
					${messages}
				</div>
			`.trim()
		});
	},
	failedSubmit: (title, messages, isNew = true) => {
		swal({
			...defaultOptions,
			type: 'error',
			title: 'Oops!',
			html: `
				<p>
					Your ${isNew ? `${title} was` : 'changes were'}
					unable to be saved due to the following issues:
				</p>
				<div style="text-align: left;">
					${messages}
				</div>
			`.trim()
		});
	},
	successfulChanges: projectId => {
		swal({
			...defaultOptions,
			type: 'success',
			title: 'Awesome!',
			text: 'Your changes have been saved successfully'
		}).then(() => {
			window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&pk_id=${projectId}`;
		});
	},
	successfulCommentSubmission: (title, projectId, action) => {
		if (['approve', 'returnForReview', 'reject'].indexOf(action) === -1) {
			logError('Invalid action for comment submission alert.');

			return;
		}
		const actionText = {
			approve: 'moved to the next stage of approval',
			returnForReview: 'returned to the PI for review',
			reject: 'marked as rejected'
		};
		swal({
			...defaultOptions,
			type: 'success',
			title: 'Awesome!',
			text: `Your comments have been submitted successfully, and the ${title} has been ${actionText[action]}`
		}).then(() => { window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&pk_id=${projectId}`; });
	},
	successfulDelete: title => {
		swal({
			...defaultOptions,
			type: 'success',
			title: 'Awesome!',
			text: `You have successfully deleted this ${title}.`,
			confirmButtonText: 'OK'
		}).then(result => {
			window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm`;
		});
	},
	successfulReject: (title, projectId) => {
		swal({
			...defaultOptions,
			type: 'success',
			title: 'Awesome!',
			text: `You have successfully rejected this ${title}.`,
			confirmButtonText: 'OK'
		}).then(result => {
			if (result.value)

				// They clicked OK
				window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&pk_id=${projectId}`;
		});
	},
	successfulResultsFileUpload: (title, projectId) => {
		swal({
			...defaultOptions,
			type: 'success',
			title: 'Awesome!',
			text: `You have successfully uploaded a results file for this ${title}.`,
			confirmButtonText: 'OK'
		}).then(result => {
			if (result.value)

				// They clicked OK
				window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&pk_id=${projectId}`;
		});
	},
	successfulReturnForReview: (title, projectId) => {
		swal({
			...defaultOptions,
			type: 'success',
			title: 'Awesome!',
			text: `This ${title} has been successfully returned to the PI for review.`,
			confirmButtonText: 'OK'
		}).then(result => {
			if (result.value)

				// They clicked OK
				window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&pk_id=${projectId}`;
		});
	},
	successfulSave: (title, projectId) => {
		swal({
			...defaultOptions,
			type: 'success',
			title: 'Awesome!',
			text: `Your ${title} has been saved successfully.`,
			confirmButtonText: 'OK'
		}).then(() => {
			window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&pk_id=${projectId}`;
		});
	},
	successfulSubmit: (title, submitter, projectId) => {
		const messages = {
			success: {
				title: 'Awesome!',
				successfulSubmit: {
					approver: `Your ${title} has been submitted successfully and moved to the next stage of approval.`,
					originator: `Your ${title} has been submitted successfully.`
				}
			}
		};
		swal({
			...defaultOptions,
			type: 'success',
			title: messages.success.title,
			text: messages.success.successfulSubmit[submitter],
			confirmButtonText: 'OK'
		}).then(result => {
			if (result.value)

				// They clicked OK
				window.location.href = `https://${window.location.hostname}/CAESResearchFarmProject/index.cfm?function=projectForm&pk_id=${projectId}`;
		});
	}
};
