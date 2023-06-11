<template lang="html">
	<div>
		<h3>
			Media Produced
		</h3>
		<fieldset v-if="mode === 'edit'">
			<label>
				<h4>
					Type
				</h4>
				<select v-model="record.TYPE_ID">
					<option
						v-for="type in mediaTypes"
						:key="type.ID"
						:value="type.ID"
						:selected="type.LABEL === '(None)'"
					>
						{{ type.LABEL }}
					</option>
				</select>
			</label>
			<label>
				<h4>
					Title/Citation
				</h4>
				<textarea v-model="record.CITATION"></textarea>
			</label>
			<label>
				<h4>
					Review Type
				</h4>
				<select v-model="record.REVIEW_TYPE_ID">
					<option
						v-for="type in reviewTypes"
						:key="type.ID"
						:value="type.ID"
						:selected="type.LABEL === '(None)'"
					>
						{{ type.LABEL }}
					</option>
				</select>
			</label>
		</fieldset>
		<div v-else>
			<h4 class="inline">
				Type:
			</h4>
			<span>
				{{ getMediaTypeLabelFromID(record.TYPE_ID) }}
			</span>
			<br />
			<h4 class="inline">
				Title/Citation:
			</h4>
			<span>
				{{ record.CITATION }}
			</span>
			<br />
			<h4 class="inline">
				Review Type:
			</h4>
			<span>
				{{ getReviewTypeLabelFromID(record.REVIEW_TYPE_ID) }}
			</span>
		</div>
	</div>
</template>

<script>
	import {
		getCriteriaStructure,
		logError
	} from '~/modules/caesdb';
	import {
		getMediaProduction,
		getMediaReviewType,
		getMediaType
	} from '~/modules/caesdb/gacounts3';
	import { modeValidator } from '~/modules/utilities';

	export default {
		name: 'MediaProduced',
		props: {
			mode: {
				type: String,
				default: 'view',
				validator: modeValidator
			}
		},
		data () {
			return {
				mediaTypes: [],
				reviewTypes: []
			};
		},
		computed: {
			duplication () { return this.$store.state.duplication; },
			fetched: {
				get () { return this.$store.state.mediaProduced.fetched; },
				set (val) { this.$store.state.mediaProduced.fetched = val; }
			},
			record: {
				get () {
					if (this.$store.state.mediaProduced.records.length < 1) return {
						ID: null,
						REPORT_ID: null,
						TYPE_ID: null,
						CITATION: null,
						REVIEW_TYPE_ID: null,
						STATUS_ID: 3
					};

					return this.$store.state.mediaProduced.records[0];
				},
				set (val) {
					this.$store.state.mediaProduced.records = [];
					this.$store.state.mediaProduced.records.push(val);

					// If (this.$store.state.mediaProduced.records.length > 1) {
					// 	this.$
					// };
				}
			},
			reportID () { return this.$store.state.report.ID; }
		},
		mounted () {
			const fetchExisting = () => {
				getCriteriaStructure('GACOUNTS3', 'GC3_MEDIA_PRODUCTION', (err, data) => {
					if (err) logError(err);
					if (data) {
						const critStruct = data;
						critStruct.criteria_REPORT_ID_eq = [this.reportID || this.duplication.reportID];
						getMediaProduction(critStruct, (err, data) => {
							if (err) logError(err);
							if (data) if (data.length < 1) {
								this.populateRecord();
							} else {
								this.record = data[0];
								if (!this.reportID && this.duplication.reportID) {
									this.record.ID = null;
									this.record.REPORT_ID = null;
								}
							}
						});
					}
				});
			};

			const getMediaTypes = () => {
				getMediaType((err, data) => {
					if (err) logError(err);
					if (data) {
						this.mediaTypes = data;
						this.mediaTypes.unshift({
							ID: null,
							LABEL: '(None)'
						});
					}
				});
			};

			const getReviewTypes = () => {
				getMediaReviewType((err, data) => {
					if (err) logError(err);
					if (data) {
						this.reviewTypes = data;
						this.reviewTypes.unshift({
							ID: null,
							LABEL: '(None)'
						});
					}
				});
			};

			getMediaTypes();
			getReviewTypes();
			if ((this.reportID !== null || this.duplication.associations.mediaProduced) && !this.fetched) fetchExisting();
			if (this.reportID === null && !this.fetched) this.populateRecord();
		},
		methods: {
			getMediaTypeLabelFromID (id) {
				if (id === null) return '';
				const index = this.mediaTypes.map(t => t.ID).indexOf(id);
				if (index === -1) return '';

				return this.mediaTypes[index].LABEL;
			},
			getReviewTypeLabelFromID (id) {
				if (id === null) return '';
				const index = this.reviewTypes.map(t => t.ID).indexOf(id);
				if (index === -1) return '';

				return this.reviewTypes[index].LABEL;
			},
			populateRecord () {
				this.$store.state.mediaProduced.records.push(this.record);
			}
		}
	};
</script>

<style lang="scss" scoped>
	fieldset {
		border: none;
	}
</style>
