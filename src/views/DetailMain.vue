<!-- The HTML portion of the component -->
<template lang="html">
	<div :class="`${mode}-mode`">
		<ContextualHelpMessage
			v-if="helpMessage.show"
			:message-fetcher="schema.messageFetcher"
			:message-name="helpMessage.name"
			@close-modal="hideHelp"
		/>
		<div v-if="requestsInProgress" class="application-loading-overlay">
			<div class="container">
				<Spinner />
				<p>Loading...</p>
			</div>
		</div>
		<h3 v-if="mode === 'edit' && hasRequiredFields">
			<em>
				<span class="is-red">Required fields marked by an *</span>
			</em>
		</h3>
		<section v-for="section in schema.sections" :key="section.title">
			<h2 class="head section-heading" @click="toggleSection(section)">
				<ChevronDownIcon
					v-if="sectionShouldBeDisplayed(section)"
					class="hide-on-print"
				/>
				<ChevronRightIcon v-else class="hide-on-print" />
				{{ section.title }}
				<em v-if="section.required" class="hide-on-print required-label">
					(Required)
				</em>
			</h2>
			<div v-if="sectionShouldBeDisplayed(section)">
				<div v-if="sectionDependenciesMet(section)">
					<div v-if="section.customComponent">
						<component
							:is="section.customComponent"
							:mode="mode"
							@show-help="showHelp"
						/>
					</div>
					<div v-else :class="getSectionClasses(section)">
						<div
							v-for="area in section.areas"
							:key="area.data.title || area.data.columnName"
							:class="
								`area ${
									area.data.customClasses
										? area.data.customClasses.join(' ')
										: ''
								}`
							"
						>
							<transition appear name="fade">
								<div
									v-if="
										area.type === 'column' && columnShouldBeDisplayed(area.data)
									"
								>
									<component
										:is="area.data.customComponent"
										v-if="
											area.data.customComponent &&
												dependencyMet(area.data) &&
												area.data.type === 'int'
										"
										v-model.number="record[area.data.columnName]"
										:mode="getMode(area.data)"
										@show-help="showHelp"
										@expand-section="expandSection"
										@collapse-section="collapseSection"
									/>
									<component
										:is="area.data.customComponent"
										v-else-if="
											area.data.customComponent && dependencyMet(area.data)
										"
										v-model="record[area.data.columnName]"
										:mode="getMode(area.data)"
										@show-help="showHelp"
										@expand-section="expandSection"
										@collapse-section="collapseSection"
									/>
									<SmartInput
										v-else-if="mode === 'edit' && area.data.type === 'int'"
										v-model.number="record[area.data.columnName]"
										:field="area.data"
										:fetched="record._fetched"
										@show-help="showHelp(area.data)"
									/>
									<SmartInput
										v-else-if="mode === 'edit'"
										v-model="record[area.data.columnName]"
										:field="area.data"
										:fetched="record._fetched"
										@show-help="showHelp(area.data)"
										@delete-file="deleteFile(area.data)"
										@reset-value="record[area.data.columnName] = null"
									/>
									<div
										v-else-if="
											mode === 'view' && area.data.customComponentForViewMode
										"
									>
										<component
											:is="area.data.customComponentForViewMode.component"
											:options="area.data.customComponentForViewMode.options"
										/>
									</div>
									<div
										v-else-if="
											typeof record[area.data.columnName] !== 'undefined' &&
												record[area.data.columnName] !== null &&
												record[area.data.columnName] !== ''
										"
									>
										<h3 class="inline">
											{{
												area.data.prettyName ||
													getPrettyColumnName(area.data.columnName)
											}}:
										</h3>
										<span
											v-if="
												area.data.inputType === 'select' ||
													sqlToHtml(area.data) === 'select'
											"
										>
											{{
												getOptionLabel(
													area.data.constraint,
													record[area.data.columnName]
												)
											}}
										</span>
										<div v-else-if="area.data.inputType === 'file'">
											<a
												v-if="isString(record[area.data.columnName])"
												:href="
													`${application.attachmentWebPath}${
														record[area.data.columnName]
													}`
												"
											>
												{{ record[area.data.columnName] }}
											</a>
											<div v-else-if="isFile(record[area.data.columnName])">
												<span>{{ record[area.data.columnName].name }}</span>
												<br />
												<em class="is-small">(Not yet uploaded)</em>
											</div>
										</div>
										<span v-else-if="area.data.type === 'bit'">
											{{ record[area.data.columnName] ? "Yes" : "No" }}
										</span>
										<span v-else>
											{{ record[area.data.columnName] }}
										</span>
									</div>
									<div v-else>
										<h3 class="inline">
											{{
												area.data.prettyName ||
													getPrettyColumnName(area.data.columnName)
											}}:
										</h3>
										<span>
											<em>(None)</em>
										</span>
									</div>
								</div>
								<div v-else-if="area.type === 'association' && !area.hidden">
									<div
										v-if="
											area.data.isExternal &&
												identifier.value &&
												dependencyMet(area.data)
										"
									>
										<!-- Then just show the association title and link to edit it -->
										<h3>
											{{ area.data.title }}
										</h3>
										<p>
											<a
												:href="
													area.data.source.url +
														(area.data.source.hasParams ? '&' : '?') +
														area.data.source.selector +
														'=' +
														identifier.value
												"
												class="button"
											>
												Edit
											</a>
										</p>
									</div>
									<!-- If it uses a custom component, render that component -->
									<div v-else-if="area.data.customComponent">
										<component
											:is="area.data.customComponent"
											v-if="dependencyMet(area.data)"
											:mode="getMode(area.data)"
											:identifier="generateIdentifier(area.data)"
											@show-help="showHelp"
											@expand-section="expandSection"
											@collapse-section="collapseSection"
										/>
									</div>
									<!-- If it's a multiselect association, use a data multi select component -->
									<div v-else-if="area.data.multiSelect">
										<DataMultiSelect
											v-if="dependencyMet(area.data)"
											:associated-column="area.data.associatedColumn"
											:filter="area.data.filter"
											:group-by="area.data.groupBy"
											:group-label="area.data.groupLabel"
											:groups-to-show="area.data.groupsToShow"
											:identifier="generateIdentifier(area.data)"
											:schema="area.data.schema"
											:title="area.data.title"
											:description="area.data.description"
											:affects="area.data.affects"
											:help-message-name="area.data.helpMessageName"
											:mode="getMode(area.data)"
											:max-allowed="area.data.maxAllowed"
											@show-help="showHelp(area.data)"
										/>
									</div>
									<!-- If multiple values are forbidden, use a data radio component -->
									<div v-else-if="area.data.forbidMultiple">
										<DataRadio
											v-if="dependencyMet(area.data)"
											:title="area.data.title"
											:schema="area.data.schema"
											:associated-column="area.data.associatedColumn"
											:identifier="generateIdentifier(area.data)"
											:filter="area.data.filter"
											:description="area.data.description"
											:affects="area.data.affects"
											:help-message-name="area.data.helpMessageName"
											:mode="getMode(area.data)"
											@show-help="showHelp(area.data)"
										/>
									</div>
									<div v-else-if="area.data.displayAllOptions">
										<DataMultiTable
											v-if="dependencyMet(area.data)"
											:title="area.data.title"
											:schema="area.data.schema"
											:associated-column="area.data.associatedColumn"
											:identifier="generateIdentifier(area.data)"
											:option-column-name="area.data.optionColumnName"
											:filter="area.data.filter"
											:show-totals="area.data.showTotals"
											:depends="area.data.depends"
											:description="area.data.description"
											:help-message-name="area.data.helpMessageName"
											:mode="getMode(area.data)"
											@show-help="showHelp(area.data)"
										/>
									</div>
									<!-- Else, just use a data table component -->
									<div
										v-else-if="
											!identifier.value ? area.data.isAssignable : true
										"
									>
										<DataTable
											v-if="dependencyMet(area.data)"
											:title="area.data.title"
											:schema="area.data.schema"
											:associated-column="area.data.foreignKey"
											:identifier="generateIdentifier(area.data)"
											:allow-insert="true"
											:allow-edit="true"
											:description="area.data.description"
											:help-message-name="area.data.helpMessageName"
											:mode="getMode(area.data)"
											:record-limit="area.data.limit"
											@show-help="showHelp(area.data)"
										/>
									</div>
								</div>
								<div v-else-if="area.type === 'subschema'">
									<component
										:is="area.data.customComponent"
										:mode="getMode(area.data)"
										@show-help="showHelp"
									/>
								</div>
								<fieldset
									v-else-if="
										area.type === 'fieldset' && dependencyMet(area.data)
									"
									:class="mode === 'view' ? 'view-mode' : ''"
								>
									<legend>
										<h3>
											{{ area.data.title }}
											<em
												v-if="area.data.required && mode === 'edit'"
												class="required-asterisk"
												>*</em
											>
											<em v-if="area.data.caveat" class="is-small">
												({{ area.data.caveat }})
											</em>
										</h3>
									</legend>
									<p v-if="area.data.description" class="description">
										{{ area.data.description }}
									</p>
									<div class="flex-container">
										<div
											v-for="field in area.data.fields"
											:key="field.columnName"
											:class="
												field.customClasses ? field.customClasses.join(' ') : ''
											"
										>
											<div v-if="dependencyMet(field)">
												<div v-if="field.isFlexBreak" class="flex-break"></div>
												<SmartInput
													v-else-if="mode === 'edit' && field.type === 'int'"
													v-model.number="record[field.columnName]"
													:field="field"
													:is-inside-fieldset="true"
													:fetched="record._fetched"
													@show-help="showHelp(field)"
												/>
												<SmartInput
													v-else-if="mode === 'edit'"
													v-model="record[field.columnName]"
													:field="field"
													:is-inside-fieldset="true"
													:fetched="record._fetched"
													@show-help="showHelp(field)"
													@delete-file="deleteFile(field)"
													@reset-value="record[field.columnName] = null"
												/>
												<div v-else class="view-mode-wrapper">
													<h4 class="inline">
														{{
															field.prettyName ||
																getPrettyColumnName(field.columnName)
														}}:
													</h4>
													<span
														v-if="
															field.inputType === 'select' ||
																sqlToHtml(field) === 'select'
														"
													>
														{{
															getOptionLabel(
																field.constraint,
																record[field.columnName]
															)
														}}
													</span>
													<a
														v-else-if="field.inputType === 'file'"
														:href="
															`${application.attachmentWebPath}${
																record[field.columnName]
															}`
														"
													>
														{{ record[field.columnName] }}
													</a>
													<a
														v-else-if="field.inputType === 'email'"
														:href="`mailto:${record[field.columnName]}`"
													>
														{{ record[field.columnName] }}
													</a>
													<a
														v-else-if="field.inputType === 'tel'"
														:href="`tel:${record[field.columnName]}`"
													>
														{{ record[field.columnName] }}
													</a>
													<span v-else>
														{{
															typeof record[field.columnName] === "boolean"
																? record[field.columnName]
																	? "Yes"
																	: "No"
																: record[field.columnName]
														}}
													</span>
												</div>
											</div>
										</div>
									</div>
								</fieldset>
							</transition>
						</div>
					</div>
				</div>
				<div v-else>
					<p v-if="mode === 'edit'">
						In order to enter {{ section.title }}, you must first make a
						selection for
						<span v-html="getSectionDependsMessage(section)"></span>.
					</p>
					<p v-else>
						In order to see {{ section.title }}, please expand the
						<span v-html="getSectionDependsMessage(section)"></span> section(s).
					</p>
				</div>
			</div>
		</section>
		<!-- We use a data form component to display the main record -->
		<!-- <DataForm
			:schema="schema"
			:identifier="identifier"
		/>
		<div v-if="includeSubSchemas">
			<div v-for="subschema in schema.subschemas" v-bind:key="subschema.title">
				<component v-bind:is="subschema.customComponent" />
			</div>
		</div> -->
		<div v-if="mode === 'edit' && useDefaultSubmit" class="submit">
			<hr />
			<p>
				<strong>
					Finished?
				</strong>
				<span>
					Click the button below to submit your
					{{ isNew ? schema.title : "changes" }}.
				</span>
				<!-- <span v-if="!isNew">
					If you would like to, you may also <a id="delete-link" v-on:click="deleteRecord" >delete your {{ schema.title }}</a>.
				</span> -->
				<br />
				<button type="button" class="button" @click="cleanUpData">
					Save My {{ schema.title }}
				</button>
			</p>
		</div>
	</div>
</template>

<!-- The script portion of the component -->
<script>
/* global activeUserID */
/* global caesCache */
/* global notify */
/* global swal */
// Import required modules
import alert from "~/modules/applications/caes_research_farm_project/alert";
import ContextualHelpMessage from "~/views/ContextualHelpMessage";
import ChevronDownIcon from "vue-feather-icons/icons/ChevronDownIcon";
import ChevronRightIcon from "vue-feather-icons/icons/ChevronRightIcon";
import DetailMain from "~/views/DetailMain";
import prepareForCf from "~/modules/prepareForCf";
import SmartInput from "~/views/elements/SmartInput";
import Spinner from "vue-simple-spinner";
import {
	DataForm,
	DataMultiSelect,
	DataMultiTable,
	DataRadio,
	DataTable
} from "~/views/data";
import {
	deepObjectAssign,
	formatDates,
	getPrettyColumnName,
	sqlToHtml,
	stringFormats
} from "~/modules/utilities";
import { isFile, isString } from "~/modules/utilities/validation";
import { getCriteriaStructure, logError } from "~/modules/caesdb";

// Export the actual component
export default {
	// The component's name
	name: "DetailMain",

	// The nested components available to this component
	components: {
		ChevronDownIcon,
		ChevronRightIcon,
		ContextualHelpMessage,
		DataForm,
		DataMultiSelect,
		DataMultiTable,
		DataRadio,
		DataTable,
		DetailMain,
		SmartInput,
		Spinner
	},

	// The component's properties, which are set by the parent component.
	props: {
		// The schema to be used
		schema: {
			type: Object,
			required: true
		},

		// An optional identifier/selector
		identifier: {
			default: false,
			type: [Object, Boolean]
		},

		// Display mode
		mode: {
			type: String,
			required: true,
			default: "view",
			validator(value) {
				return ["edit", "view"].indexOf(value) !== -1;
			}
		},

		// Should associations be rendered too?
		includeAssociations: {
			type: Boolean,
			default: true
		},

		// How about subschemas?
		includeSubSchemas: {
			type: Boolean,
			default: true
		},
		userIsOwner: {
			type: Boolean,
			default: false
		},

		// Show default submit button/verbage?
		useDefaultSubmit: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			application: caesCache.application
				? caesCache.application
				: { attachmentWebPath: "/" },
			hasRequiredFields: this.schema.sections.reduce(
				(hasRequiredFields, section) => {
					if (section.areas)
						section.areas.forEach(area => {
							if (area.data.required) hasRequiredFields = true;
						});

					return hasRequiredFields;
				},
				false
			),
			helpMessage: {
				show: false,
				name: ""
			},
			requestsInProgress:
				typeof window.pendingRequests !== "undefined" &&
				window.pendingRequests > 0,
			sectionsToDisplay: this.schema.sections.map(s => s.title)
		};
	},
	computed: {
		columns: {
			get() {
				const columns = [];
				this.schema.sections.forEach(section => {
					section.areas.forEach(area => {
						if (area.type === "column") columns.push(area.data);
						else if (area.type === "fieldset")
							area.data.fields.forEach(column => {
								columns.push(column);
							});
					});
				});

				return columns;
			}
		},
		dateFields() {
			const dateFields = [];
			this.columns.forEach(column => {
				if (sqlToHtml(column) === "date") dateFields.push(column.columnName);
			});

			return dateFields;
		},
		duplication() {
			return this.$store.state.duplication;
		},
		isNew() {
			return (
				this.identifier === null ||
				this.identifier === false ||
				this.identifier.duplicate
			);
		},
		record: {
			get() {
				return this.$store.state[stringFormats.camelCase(this.schema.title)];
			},
			set(val) {
				this.$store.state[stringFormats.camelCase(this.schema.title)] = val;
			}
		}
	},
	watch: {
		duplication: {
			handler() {
				this.getMainData();
			},
			deep: true
		}
	},
	mounted() {
		// Set up the watcher for pending requests
		setInterval(() => {
			if (
				this.requestsInProgress !==
				(typeof window.pendingRequests !== "undefined" &&
					window.pendingRequests > 0)
			)
				this.requestsInProgress =
					typeof window.pendingRequests !== "undefined" &&
					window.pendingRequests > 0;
		}, 300);

		const getConstraintData = () => {
			this.columns.forEach(column => {
				// We only care about columns that have a constraint and a getValues
				// function, since those are the ones we have to fetch values for
				if (column.constraint && column.constraint.getValues)
					if (column.constraint.tablePrefix) {
						// If the constraint has a tablePrefix, we need to get a criteria
						// structure first, then send our request
						getCriteriaStructure(
							column.constraint.databaseName,
							column.constraint.tablePrefix,
							(err, criteriaStructure) => {
								if (err) logError(err);
								criteriaStructure[column.constraint.criteria.string] = column
									.constraint.criteria.useUserID
									? activeUserID
									: column.constraint.criteria.value;
								column.constraint.getValues(criteriaStructure, (err, data) => {
									if (err) logError(err);
									if (data) column.constraint.values = data;
								});
							}
						);
					} else {
						// If no table prefix, just fetch the data
						column.constraint.getValues((err, data) => {
							if (err) logError(err);
							if (data) column.constraint.values = data;
						});
					}
			});
		};

		if (this.identifier) this.getMainData();
		getConstraintData();
	},

	// The methods available to this component during render
	methods: {
		isFile,
		isString,
		getPrettyColumnName,
		deleteFile(column) {
			swal
				.fire({
					title: "Are you sure?",
					text: "This will also delete the file from the server.",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#6c3129",
					cancelButtonColor: "#004e60",
					confirmButtonText: "Yes, delete it!"
				})
				.then(async result => {
					if (result.value)
						try {
							const response = await column.deleteFile(
								this.record.ID,
								this.record[column.columnName]
							);
							if (response.success) this.record[column.columnName] = null;
							else
								alert.failedDelete(
									this.getPrettyColumnNameFromColumnName(column.columnName),
									response.messages
								);
						} catch (err) {
							logError(err);
							alert.failedDelete(
								this.getPrettyColumnNameFromColumnName(column.columnName),
								"<p>Server error.  If the problem persists please contact caesweb@uga.edu.</p>"
							);
						}
				});
		},
		getSectionClasses(section) {
			if (typeof section.disableFlex === "undefined") return "flex-section";
			if (section.disableFlex === true) return "";
			if (section.disableFlex === false) return "flex-section";
			if (
				typeof section.disableFlex === "object" &&
				typeof section.disableFlex.modes !== "undefined" &&
				Array.isArray(section.disableFlex.modes)
			) {
				const disableForViewMode =
					section.disableFlex.modes.indexOf("view") !== -1;
				const disableForEditMode =
					section.disableFlex.modes.indexOf("edit") !== -1;
				if (disableForViewMode && this.mode === "view") return "";
				if (disableForEditMode && this.mode === "edit") return "";

				return "flex-section";
			}

			return "";
		},
		showHelp(area) {
			if (area.helpMessageName) {
				this.helpMessage.name = area.helpMessageName;
				this.helpMessage.show = true;
			}
		},
		hideHelp() {
			this.helpMessage.show = false;
			this.helpMessage.name = "";
		},
		deleteRecord() {
			swal({
				title: "Are you sure?",
				text: "You won't be able to undo this!",
				type: "warning",
				showCancelButton: true,
				confirmButtonText: "Yes, delete it!"
			}).then(result => {
				if (result.value)
					this.schema.deleteExisting(this.identifier.value, (err, data) => {
						if (err) logError(err);
						if (data.SUCCESS)
							swal(
								"Deleted!",
								`Your ${this.schema.title} has been deleted.`,
								"success"
							).then(() => {
								window.location.assign(
									`https://${window.location.hostname}/gacounts3`
								);
							});
						else
							swal(
								"Oops!",
								`Something went wrong on our end and your ${this.schema.title} could not be deleted.`,
								"error"
							);
					});
			});
		},

		// Clean up any extra data that no longer applies based on current
		// selections/entries
		cleanUpData() {
			const schemaLessStore = deepObjectAssign({}, this.$store.state);
			delete schemaLessStore.schema;
			const cleanedUpStore = this.schema.cleanUpData(schemaLessStore);
			this.schema.sections.forEach(section => {
				section.areas.forEach(area => {
					const areaCamelTitle = stringFormats.camelCase(area.data.title);
					if (
						area.type === "association" &&
						area.data.schema &&
						area.data.schema.prepareForSubmit
					) {
						const { records } = schemaLessStore[areaCamelTitle];
						schemaLessStore[
							areaCamelTitle
						].records = area.data.schema.prepareForSubmit(records);
					}
					if (area.type === "subschema") {
						if (area.data.schema.prepareForSubmit)
							schemaLessStore.subschemas[areaCamelTitle][
								areaCamelTitle
							] = area.data.schema.prepareForSubmit(
								schemaLessStore.subschemas[areaCamelTitle][areaCamelTitle]
							);

						area.data.schema.associations.forEach(subArea => {
							if (subArea.schema && subArea.schema.prepareForSubmit) {
								const subAreaCamelTitle = stringFormats.camelCase(
									subArea.title
								);
								const { records } = schemaLessStore.subschemas[areaCamelTitle][
									subAreaCamelTitle
								];
								schemaLessStore.subschemas[areaCamelTitle][
									subAreaCamelTitle
								].records = subArea.schema.prepareForSubmit(records);
							}
						});
					}
				});
			});
			this.validateData(cleanedUpStore);
		},

		// Run validation on the data
		validateData(store) {
			const isValid = true;
			if (isValid) this.submitData(store);
		},

		// Doesn't send anything yet, just pretends like it does
		submitData(store) {
			notify.clear();
			store = prepareForCf(store);
			this.schema.processSubmission(store, (err, data) => {
				if (err) notify.error(err);
				if (data)
					if (data.SUCCESS) {
						if (this.isNew)
							swal({
								type: "success",
								title: "Awesome!",
								text: `Your ${this.schema.title.toLowerCase()} has been saved successfully.`,
								showCancelButton: true,
								confirmButtonText: "OK",
								cancelButtonText: `Duplicate this ${this.schema.title.toLowerCase()}`
							}).then(result => {
								if (result.dismiss === swal.DismissReason.cancel)
									// They clicked duplicate
									window.location.assign(
										`${window.location}&duplicateID=${data.REPORT_ID}`
									);
								// Send them to the report
								else
									window.location.assign(
										`https://${window.location.hostname}/gacounts3/index.cfm?referenceInterface=REPORT&subInterface=detail_main&PK_ID=${data.REPORT_ID}`
									);
							});
						else
							swal(
								"Awesome!",
								"Your changes have been saved successfully.",
								"success"
							).then(result => {
								window.location.assign(
									`https://${window.location.hostname}/gacounts3/index.cfm?referenceInterface=REPORT&subInterface=detail_main&PK_ID=${data.REPORT_ID}`
								);
							});
					} else {
						swal({
							type: "error",
							title: "Oops!",
							html: `<p>Your ${
								this.isNew
									? `${this.schema.title.toLowerCase()} was`
									: "changes were"
							} unable to be saved due to the following issues:</p><div style="text-align: left;">${
								data.MESSAGES
							}</div>`
						});
					}
			});
		},
		columnShouldBeDisplayed(column) {
			if (this.mode === "view" && column.showOnView) return true;
			if (!column.depends) {
				if (column.automated) return false;

				return true;
			}
			if (column.depends.column) {
				if (typeof column.depends.column === "string")
					return column.depends.test(this.record[column.depends.column]);
				if (Array.isArray(column.depends.column))
					return column.depends.test(
						column.depends.column.map(column => this.record[column])
					);
			} else if (column.depends.useValues && column.depends.association) {
				if (column.depends.useColumnValue) {
					return column.depends.test(
						this.record[column.columnName],
						this.$store.state[
							stringFormats.camelCase(column.depends.association)
						].records,
						this.$store.state.schema
					);
				} else {
					return column.depends.test(
						this.$store.state[
							stringFormats.camelCase(column.depends.association)
						].records,
						this.$store.state.schema
					);
				}
			} else {
				return column.depends.test();
			}
		},

		// A function to determine if an association's dependency has been met
		dependencyMet(association) {
			// If there is no dependency, it obviously has
			if (!association.depends) return true;

			// Otherwise, we need to make sure the association dependency specifies
			// which column or association it depends on
			if (association.depends.column)
				// If it depends on a column, run the depend's test function on that
				// columns value
				return association.depends.test(
					this.$store.state[
						stringFormats.camelCase(this.schema.title || this.schema.table)
					][association.depends.column]
				);
			if (association.depends.association) {
				// If it's an association, run the test function on that association's
				// records.
				if (association.depends.useValues)
					return association.depends.test(
						this.$store.state[
							stringFormats.camelCase(association.depends.association)
						].records,
						this.$store.state.schema
					);

				return association.depends.test(
					this.$store.state[
						stringFormats.camelCase(association.depends.association)
					].records
				);
			}

			// If no column or association were specified, we're in an error state
			// so say so and consider the dependency unmet.
			logError(
				new Error(
					`Dependency information missing for association: ${association.title}`
				)
			);

			return false;
		},
		generateIdentifier(association) {
			return {
				key: association.foreignKey,
				value: this.identifier.value,
				criteriaString:
					association.criteriaString || `criteria_${association.foreignKey}_eq`,
				duplicate: this.identifier.duplicate || false
			};
		},
		getMainData() {
			getCriteriaStructure(
				this.schema.databaseName,
				this.schema.tablePrefix,
				(err, data) => {
					if (err) logError(err);
					console.log("Here is the data from the getMainData fetch function: ");
					console.log(data);
					if (data) {
						const critStruct = data;
						critStruct[this.schema.criteria.string] = this.identifier.value;
						this.schema.fetchExisting(critStruct, (err, data) => {
							if (err) logError(err);
							if (data && data.length > 0) {
								const existingRecord = data[0];
								for (const key in this.record)
									if (
										(this.identifier.duplicate &&
											this.duplication.columns[key]) ||
										!this.identifier.duplicate
									)
										if (existingRecord.hasOwnProperty(key)) {
											this.record[key] = existingRecord[key];
										} else {
											console.warn(
												`Local record has key "${key}" but remote record does not.`
											);
										}

								if (this.dateFields.length > 0)
									formatDates(this.dateFields, this.record);
								this.record._fetched = true;
							}
						});
					}
				}
			);
		},
		getMode(area) {
			if (area.disallowEditOfExisting) {
				if (this.isNew) return this.mode;

				return "view";
			}

			return this.mode;
		},
		getOptionLabel(constraint, value) {
			if (constraint.values.length < 1) return "";
			const constraintValuesMap = constraint.values.map(
				v => v[constraint.foreignKey]
			);
			const index = constraintValuesMap.indexOf(value);
			const option = constraint.values[index];
			if (!option) return "";
			const label = option[constraint.foreignLabel];

			return label;
		},
		getPrettyColumnNameFromColumnName(columnName) {
			const columnIndex = this.columns
				.map(c => c.columnName)
				.indexOf(columnName);
			if (columnIndex === -1) return columnName;

			return (
				this.columns[columnIndex].prettyName ||
				getPrettyColumnName(this.columns[columnIndex].columnName)
			);
		},
		getSectionDependsMessage(section) {
			let message = "";
			let totalDependencies = 0;
			let listedDependencies = 0;
			if (section.depends.columns)
				totalDependencies += section.depends.columns.length;
			if (section.depends.associations)
				totalDependencies += section.depends.associations.length;
			if (section.depends.columns)
				section.depends.columns.forEach(column => {
					++listedDependencies;
					if (totalDependencies === 1)
						message += `a <strong>${this.getPrettyColumnNameFromColumnName(
							column
						)}</strong>`;
					else if (listedDependencies < totalDependencies)
						message += `a <strong>${this.getPrettyColumnNameFromColumnName(
							column
						)}</strong>`;
					else
						message += `and a <strong>${this.getPrettyColumnNameFromColumnName(
							column
						)}</strong>`;
				});

			if (section.depends.associations)
				section.depends.associations.forEach(association => {
					++listedDependencies;
					if (listedDependencies < totalDependencies)
						message += `<strong>${association}</strong>, `;
					else message += `and <strong>${association}</strong>`;
				});

			return message;
		},
		sectionDependenciesMet(section) {
			if (!section.depends) return true;
			let dependenciesMet = true;
			if (section.depends.columns)
				section.depends.columns.forEach(column => {
					if (!this.record[column]) dependenciesMet = false;
				});

			if (section.depends.associations)
				section.depends.associations.forEach(association => {
					const camelTitle = stringFormats.camelCase(association);
					if (this.$store.state[camelTitle].records.length < 1)
						dependenciesMet = false;
				});

			return dependenciesMet;
		},
		sectionShouldBeDisplayed(section) {
			return this.sectionsToDisplay.indexOf(section.title) !== -1;
		},
		sqlToHtml,
		expandSection(sectionTitle) {
			if (this.sectionsToDisplay.indexOf(sectionTitle) === -1)
				this.sectionsToDisplay.push(sectionTitle);
		},
		collapseSection(sectionTitle) {
			const index = this.sectionsToDisplay.indexOf(sectionTitle);
			if (index !== -1) this.sectionsToDisplay.splice(index, 1);
		},
		toggleSection(section) {
			const index = this.sectionsToDisplay.indexOf(section.title);
			if (index === -1) this.sectionsToDisplay.push(section.title);
			else this.sectionsToDisplay.splice(index, 1);
		}
	}
};
</script>

<style lang="scss">
em.required-asterisk {
	color: #6c3129;
}
span.is-red {
	color: #6c3129;
}
em.is-small {
	font-size: 0.75em;
}
fieldset {
	legend h3 em.is-small {
		font-weight: normal;
	}
	div.flex-container {
		display: flex;
		flex-wrap: wrap;
		div {
			flex-basis: 100%;
			&.inline {
				flex-basis: auto;
				margin-right: 0.5rem;
				div.radio-container {
					h4 {
						margin: 0;
						margin-bottom: 0.5rem;
					}
					label {
						display: inline;
					}
				}
			}
			label legend h3 {
				font-size: 0.75rem;
			}
		}
	}
	p:first-of-type {
		margin-top: 0;
	}
	&.view-mode {
		margin: 1rem 0;
		legend h3 {
			margin: 0;
		}
		div.flex-container {
			display: block;
			div.view-mode-wrapper {
				display: flex;
				h4 {
					margin: 0 0.5rem 0 0;
					line-height: 1.6em;
				}
			}
		}
	}
}
div.submit {
	hr {
		margin-top: 2rem;
	}
	p {
		text-align: center;
		button {
			max-width: 100%;
			width: 32rem;
			font-size: 1.25rem;
		}
		a#delete-link {
			cursor: pointer;
		}
	}
}
div.application-loading-overlay {
	background: rgba(255, 255, 255, 0.65);
	position: fixed;
	z-index: 10;
	top: 0;
	right: 0;
	height: 100vh;
	width: 100vw;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	div.container {
		background: #fff;
		text-align: center;
		border-radius: 0.375rem;
		padding: 2rem 3rem 1rem;
		box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
	}
}
h2.section-heading {
	cursor: pointer;
	user-select: none;
	svg {
		vertical-align: middle;
	}
	em.required-label {
		font-size: 0.75rem;
		line-height: 1.6rem;
		margin-left: 0.5rem;
	}
}
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
	opacity: 0;
}
li.list-complete-item {
	transition: all 0.5s;
	display: list-item;
}
li.list-complete-enter,
.list-complete-leave-to {
	opacity: 0;
	transform: translateX(-1.5rem);
}
li.list-complete-leave-active {
	position: absolute;
}
div.view-mode {
	div.flex-section {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		div.area {
			margin: 0 0.5rem;
			flex-grow: 1;
			&.full-width {
				flex-basis: 100%;
			}
		}
	}
}
@media print {
	div.view-mode div.flex-section {
		justify-content: flex-start;
		div.area {
			flex-grow: 0;
			table {
				width: auto;
				border-collapse: collapse;
			}
			table,
			th,
			td {
				border: 1px solid #000;
			}
		}
	}
	h2.section-heading {
		margin-bottom: 0;
	}
	div.area h3 {
		margin-top: 0.25em;
		margin-bottom: 0.25em;
	}
}
</style>
