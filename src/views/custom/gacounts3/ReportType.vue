<template lang="html">
	<div class="two-column">
		<DataRadio
			:title="area.data.title"
			:schema="area.data.schema"
			:associated-column="area.data.associatedColumn"
			:identifier="identifier"
			:filter="area.data.filter"
			:description="area.data.description"
			:affects="area.data.affects"
			:help-message-name="area.data.helpMessageName"
			:mode="mode"
			class="report-type-list"
		/>
		<div v-if="shouldShowDetails" class="details">
			<h4>
				<span class="icon-wrapper">
					<InfoIcon />
				</span>
				<span>
					Report Type: {{ selectedReportType.LABEL }}
				</span>
			</h4>
			<p>
				{{ selectedReportType.DESCRIPTION }}
			</p>
			<p>
				<strong>Examples:</strong>
				<span>{{ selectedReportType.EXAMPLES }}</span>
			</p>
			<p>
				<strong>Where on the FAR:</strong>
				<span>{{ selectedReportType.FAR_LOCATION }}</span>
			</p>
		</div>
	</div>
</template>

<script>
	/* global caesCache */
	import { DataRadio } from '~/views/data';
	import { getSortedSchema } from '~/modules/schemaTools';
	import { InfoIcon } from 'vue-feather-icons';
	import reportSchema from '~/schemas/gacounts3/report';
	import { singleItem } from '@gabegabegabe/utils/dist/array/reducers';

	export default {
		name: 'ReportType',
		components: { DataRadio, InfoIcon },
		props: {
			identifier: {
				type: Object,
				default: null
			},
			mode: {
				type: String,
				default: 'view'
			}
		},
		data () {
			const area = getSortedSchema(reportSchema)
				.sections
				.filter(({ title }) => title === 'Main Report Information')
				.reduce(singleItem)
				.areas
				.filter(({ data: { title } }) => title === 'Report Type')
				.reduce(singleItem);

			return { area };
		},
		computed: {
			editMode () { return this.mode === 'edit'; },
			selectedReportType () {
				if (this.$store.state.reportType.records.length < 1) return null;

				const { TYPE_ID } = this.$store.state.reportType.records.reduce(singleItem);

				return caesCache.data.gc3.reportType
					.filter(({ ID }) => ID === TYPE_ID)
					.reduce(singleItem);
			},
			shouldShowDetails () {
				if (!this.editMode) return false;
				if (this.$store.state.programAreas.records.length < 1) return false;
				if (!this.selectedReportType) return false;
				if (!this.selectedReportType.DESCRIPTION) return false;
				if (!this.selectedReportType.EXAMPLES) return false;
				if (!this.selectedReportType.FAR_LOCATION) return false;

				return true;
			}
		}
	};
</script>

<style lang="scss" scoped>
	div.two-column {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;

		& > div.report-type-list { flex-basis: 17rem; }

		div.details {
			background-color: #87bcde;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
			margin-top: 3rem;
			flex: 0 1 35rem;

			h4 {
				background-color: rgba(0, 0, 0, 0.1);
				margin-top: 0;
				padding: 1rem;
				display: flex;
				align-items: center;

				span {
					font-size: 1.2rem;

					&.icon-wrapper { margin-right: 0.5rem; }
				}
			}

			p {
				padding: 0 1rem;

				&,
				span,
				strong { font-size: 1rem; }
			}
		}
	}
</style>
