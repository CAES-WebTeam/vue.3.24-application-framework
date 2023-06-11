<template lang="html">
	<div>
		<label v-if="mode === 'edit'">
			<legend>
				<h3>Financial Support</h3>
				<p>
					Please enter the dollar amount (cash or value of in-kind contributions)
					{{ `allocated${farmText}.` }}
				</p>
			</legend>
			<input
				type="number"
				required="true"
				min="0"
				:value="value"
				@input="$emit('input', $event.target.value)"
			/>
		</label>
		<div v-else>
			<h3>Financial Support Allocated{{ farmText }}</h3>
			<p>${{ value }}</p>
		</div>
	</div>
</template>

<script>
	/* global caesCache */

	export default {
		name: 'FinancialSupport',
		props: {
			mode: {
				type: String,
				default: 'view'
			},
			value: {
				type: Number,
				default: 0
			}
		},
		computed: {
			farmText () {
				const farmId = this.$store.state.project.PARTICIPATING_RESEARCH_FARM_ID;
				if (!farmId) return '';

				const farm = caesCache.data.crfp.researchFarm
					.filter(f => f.ID === farmId)
					.reduce(f => f);

				return farm ? ` to ${farm.NAME}` : '';
			}
		}
	};
</script>

<style lang="scss" scoped>
	h3 { margin-bottom: 0; }
	input[type="number"] { width: auto; }
</style>
