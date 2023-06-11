<template lang="html">
	<div v-if="displayImportButton">
		<button type="button" class="load-modal" @click="openModal">
			<img src="/global/images/4h-logo-white-transparent.svg" /> Import 4-H
			Enrollment Activity Demographics
		</button>
		<div v-if="displayModal" class="modal" @click="closeModal">
			<div class="container">
				<span class="close">
					<XIcon @click="closeModal" />
				</span>
				<h2>
					4-H Enrollment Activity Import
				</h2>
				<div v-if="!loadingActivity">
					<form>
						<label>
							<strong>
								County
							</strong>
							<select v-model="countyName" :disabled="counties.length < 1">
								<option
									v-for="county in counties"
									:key="county.ID"
									:value="county.COUNTYNAME"
								>
									{{ county.COUNTYNAME }}
								</option>
							</select>
						</label>
						<label class="checkbox-container">
							<input type="checkbox" v-model="includeAdultsCheckbox" />
							<span>Were adults part of your target audience?</span>
						</label>
						<label class="activity">
							<strong>
								Activities
							</strong>
							<p>
								<em
									>Note: To select multiple actvities, hold down the CTL key as
									you select them.</em
								>
							</p>
							<select
								v-if="!loadingActivityList"
								v-model="activityIDs"
								:disabled="activities.length < 1"
								multiple
								:size="activities.length < 15 ? activities.length : 15"
							>
								<option
									v-for="activity in activities"
									:key="activity.ACTIVITY_ID"
									:value="activity.ACTIVITY_ID"
									:class="
										activityAlreadyImported(activity.ACTIVITY_ID)
											? 'alreadyImported'
											: ''
									"
								>
									{{ activity.NAME }} - ({{
										activity.BEGIN_DATE | simple-date
									}})
								</option>
							</select>
							<Spinner v-else />
						</label>
						<div class="button-container">
							<button
								type="button"
								:disabled="activityIDs.length < 1"
								@click="fetchActivity(includeAdultsCheckbox)"
							>
								Import
							</button>
						</div>
					</form>
				</div>
				<Spinner v-else />
			</div>
		</div>
	</div>
</template>

<script>
	/* eslint no-magic-numbers: off */
	/* global activeUser */
	/* global notify */
	/* global swal */
	import { singleItem } from '@gabegabegabe/utils/dist/array/reducers';
	import { toKey } from '@gabegabegabe/utils/dist/array/mappers';
	import Spinner from 'vue-simple-spinner';
	import { url } from '~/modules/utilities';
	import XIcon from 'vue-feather-icons/icons/XIcon';
	import {
		get4HActivity,
		get4HActivityList,
		getAssociationReport4HEnrollmentActivity,
		getCounties
	} from '~/modules/caesdb/gacounts3';
	import { getCriteriaStructure,
		logError
	} from '~/modules/caesdb';

	export default {
		name: 'FourHImport',
		components: {
			Spinner,
			XIcon
		},
		props: {
			mode: {
				type: String,
				default: 'view',
				validator (value) {
					return ['edit', 'view'].indexOf(value) !== -1;
				}
			}
		},
		data () {
			return {
				activityID: null,
				activityIDs: [],
				activities: [],
				countyName: null,
				counties: [],
				displayModal: false,
				existingAssociations: [],
				loadingActivity: false,
				loadingActivityList: false,
				//Added checkbox for 4-H Adult Scott/Jesse 05/23/23
			    includeAdultsCheckbox: false,
			};
		},
		computed: {
			displayImportButton () {
				// If it's not new, don't allow import
				if (!this.isNew) return false;

				// If it is new and isn't a duplicate, sure they can import
				if (!this.isDuplicate) return true;

				// Determine if demographics have been selected for duplication
				const {
					$store: {
						state: {
							duplication: {
								associations: {
									contacts,
									ethnicDemographics,
									racialDemographics,
									residenceDemographics,
									targetAudiences
								}
							}
						}
					}
				} = this;

				// If they have, don't allow tampering with activity associations
				if (contacts || ethnicDemographics || racialDemographics || residenceDemographics || targetAudiences) return false;

				// If they haven't, then sure allow import
				return true;
			},
			isDuplicate () { return url.getParam('duplicateID') !== null; },
			isNew () { return url.getParam('new') !== null; }
		},
		watch: {
			countyName () {
				this.activityIDs = [];
				this.fetchActivityList();
			}
		},
		mounted () {
			if (this.isNew) this.fetchCountyList();
			getCriteriaStructure('GACOUNTS3', 'GC3_ASSOCIATION_REPORT_4H_ENROLLMENT_ACTIVITY', (err, data) => {
				if (err) logError(new Error('Could not fetch criteria structure'));
				if (!data) return;

				const critStruct = { ...data };
				critStruct.criteria_REPORT_OWNER_ID_eq.push(activeUserID);
				getAssociationReport4HEnrollmentActivity(critStruct, (subErr, subData) => {
					if (subErr) logError(new Error('Could not fetch enrollment activity associations'));
					if (!subData) return;

					subData
						// eslint-disable-next-line no-unused-vars
						.map(({ REPORT_ID, DATE_CREATED, ...association }) => association)
						.forEach(association => this.existingAssociations.push(association));
				});
			});
		},
		methods: {
			activityAlreadyImported (activityID) {
				return this.existingAssociations.map(toKey('ACTIVITY_ID')).indexOf(activityID) !== -1;
			},
			closeModal (event) {
				if (event.target.matches('div.modal') || event.target.matches('span.close svg.feather')) this.displayModal = false;
			},
			async fetchActivity (includeAdultsCheckbox) {
				this.loadingActivity = true;
				const promisedGet4HActivity = activityId => new Promise((resolve, reject) => {
					get4HActivity(activityId, (err, data) => {
						if (err) reject(err);
						else resolve(data[0]);
					});
				});

				const summedActivities = (await Promise.all(this.activityIDs.map(id => promisedGet4HActivity({ activityID: id, includeAdults: includeAdultsCheckbox }))))
					.reduce((summedRecord, record) => {
						for (const key in record) if (key in summedRecord) summedRecord[key] = Number(summedRecord[key]) + Number(record[key]);

						return summedRecord;
					});

				this.setDemographics(summedActivities);
				this.$store.state['4HEnrollmentActivities'].records = [];
				const county = this.counties
					.filter(({ COUNTYNAME }) => COUNTYNAME === this.countyName)
					.reduce(singleItem);
				this.activityIDs.forEach(id => {
					const activity = this.activities
						.filter(({ ACTIVITY_ID }) => ACTIVITY_ID === id)
						.reduce(singleItem);

					const association = {
						ACTIVITY_ID: id,
						ACTIVITY_NAME: activity.NAME,
						ACTIVITY_COUNTY_ID: county.COUNTYLISTID,
						ACTIVITY_DATE: activity.BEGIN_DATE
					};

					this.$store.state['4HEnrollmentActivities'].records.push(association);
				});
			},
			fetchActivityList () {
				this.loadingActivityList = true;

				// Hijack pending requests since we'll already have a spinner wheel for
				// this request
				--window.pendingRequests;
				get4HActivityList({ countyName: this.countyName }, (err, data) => {
					// Fix our hijacked pending requests
					++window.pendingRequests;
					if (err) {
						logError(err);
					} else if (data) {
						if (data.length < 1 && this.displayModal) this.notifyUserAboutNoActivities();
						this.activities = data;
						this.loadingActivityList = false;
					}
				});
			},
			fetchCountyList () {
				getCounties((err, data) => {
					if (err) {
						logError(err);
					} else if (data) {
						this.counties = data;
						if (this.$store.state.report.COUNTY_ID) this.setCountyName(this.$store.state.report.COUNTY_ID);
						else if (activeUser.COUNTYLISTID) this.setCountyName(activeUser.COUNTYLISTID);
					}
				});
			},
			notifyUserAboutNoActivities () {
				notify.warn(`No 4-H enrollment activities were found for ${this.countyName} county.`);
			},
			openModal () {
				if (!this.dataImported) {
					this.$emit('expand-section', 'Supplemental Data');
					this.displayModal = true;
					if (this.countyName && this.counties.length < 1) this.notifyUserAboutNoActivities();
				}
			},
			setCountyName (countyID) {
				const countyIndex = this.counties.map(c => c.COUNTYLISTID).indexOf(Number(countyID));
				if (countyIndex > -1) this.countyName = this.counties[countyIndex].COUNTYNAME;
			},
			setDemographics (data) {
				// Contacts
				const faceToFaceIndex = this.$store.state.contacts.records.map(r => r.TYPE_ID).indexOf(1);
				if (faceToFaceIndex !== -1) this.$store.state.contacts.records[faceToFaceIndex].QUANTITY = data.CONTACTS;

				// Racial Demographics
				const raceMap = this.$store.state.racialDemographics.records.map(r => r.RACE_ID);
				const races = {
					WHITE: raceMap.indexOf(1),
					BLACK: raceMap.indexOf(2),
					ASIAN: raceMap.indexOf(3),
					AMERICAN_INDIAN: raceMap.indexOf(4),
					PACIFIC_ISLANDER: raceMap.indexOf(5)
				};
				for (const key in races) {
					const { [key]: index } = races;
					if (index !== -1) ['MALE', 'FEMALE'].forEach(gender => {
						this.$store.state.racialDemographics.records[index][`QUANTITY_${gender}`] = data[`${key}_${gender}`];
					});
				}

				// Ethnic Demographics
				const hispanicIndex = this.$store.state.ethnicDemographics.records.map(r => r.ETHNICITY_ID).indexOf(1);
				if (hispanicIndex !== -1) {
					this.$store.state.ethnicDemographics.records[hispanicIndex].QUANTITY_MALE = data.HISPANIC_MALE;
					this.$store.state.ethnicDemographics.records[hispanicIndex].QUANTITY_FEMALE = data.HISPANIC_FEMALE;
				}

				// Residence demographics
				const residenceMap = this.$store.state.residenceDemographics.records.map(r => r.TYPE_ID);
				const residences = {
					FARM: residenceMap.indexOf(1),
					RURAL: residenceMap.indexOf(2),
					TOWN: residenceMap.indexOf(3),
					SUBURBAN: residenceMap.indexOf(4),
					CITY: residenceMap.indexOf(5)
				};
				for (const key in residences) {
					const { [key]: index } = residences;
					if (index !== -1) this.$store.state.residenceDemographics.records[index].QUANTITY = data[key];
				}

				// Target Audiences
				const targAudMap = this.$store.state.targetAudiences.records.map(r => r.TYPE_ID);
				const audiences = {
					PRE_K: targAudMap.indexOf(23),
					KINDERGARTEN: targAudMap.indexOf(58),
					ONE: targAudMap.indexOf(59),
					TWO: targAudMap.indexOf(60),
					THREE: targAudMap.indexOf(61),
					FOUR: targAudMap.indexOf(25),
					FIVE: targAudMap.indexOf(26),
					SIX: targAudMap.indexOf(27),
					SEVEN: targAudMap.indexOf(28),
					EIGHT: targAudMap.indexOf(29),
					NINE: targAudMap.indexOf(30),
					TEN: targAudMap.indexOf(31),
					ELEVEN: targAudMap.indexOf(32),
					TWELVE: targAudMap.indexOf(33),
					COLLEGIATE: targAudMap.indexOf(34),
					ADULT: targAudMap.indexOf(35),
					UGA_STAFF: targAudMap.indexOf(37)
				};
				for (const key in audiences) {
					const { [key]: index } = audiences;
					if (index !== -1) this.$store.state.targetAudiences.records[index].QUANTITY = data[key];
				}

				// This can likely eventually be removed, as the k3 audience type is no
				// longer used as of june 2019.  However, legacy reports may still have
				// the type in use so I'm (gabe) leaving it here for now.
				const k3Index = targAudMap.indexOf(24);
				if (k3Index !== -1) this.$store.state.targetAudiences.records[k3Index].QUANTITY = data.KINDERGARTEN + data.ONE + data.TWO + data.THREE;

				// Supplemental Data
				const supMap = this.$store.state.supplementalData.records.map(r => r.FIELD_ID);
				const supps = {
					TOTAL_ADULT_VOLUNTEERS: supMap.indexOf(1),
					TOTAL_VOLUNTEER_HOURS: supMap.indexOf(2),
					TOTAL_YOUTH_VOLUNTEERS: supMap.indexOf(37),
					MILITARY_CONTACTS: supMap.indexOf(35)
				};
				for (const key in supps) {
					const { [key]: index } = supps;
					if (index !== -1) this.$store.state.supplementalData.records[index].FIELD_VALUE = data[key];
				}

				// We're done loading content
				this.loadingActivity = false;
				this.displayModal = false;
				swal('Success!', 'Your 4-H activity data has been imported.', 'success');
			}
		}
	};
</script>

<style lang="scss" scoped>
	option.alreadyImported::after {
		content:"(Previously imported)";
		font-size: 0.75em;
		font-style: italic;
	}

	button.load-modal {
		background: #396;

		img {
			height: 1.5rem;
			margin-right: 0.5rem;
			vertical-align: middle;
		}
	}

	div.modal {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.15);
		padding-top: 1rem;
		overflow: auto;
		display: flex;
		flex-direction: column;
		justify-content: center;

		span.close {
			display: block;
			text-align: right;

			svg { cursor: pointer; }
		}

		div.container {
			background: #fff;
			max-width: 960px;
			margin: 0 auto;
			padding: 1rem;
			box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
			display: inline-block;
			border-radius: 0.375rem;
			text-align: left;

			h2 { text-align: center; }

			form {
				display: flex;
				flex-direction: column;

				label {
					select { width: 100%; }

					&.activity {
						display: flex;
						flex-direction: column;

						div {
							flex-grow: 1;
							display: flex;
							flex-direction: column;
							justify-content: center;
							width: 20rem;
						}
					}
				}

				div.button-container {
					display: flex;
					flex-direction: column;
					justify-content: flex-end;

					button[disabled="disabled"] {
						background: #ccc;
						cursor: default;
					}
				}
			}
		}
	}
</style>
