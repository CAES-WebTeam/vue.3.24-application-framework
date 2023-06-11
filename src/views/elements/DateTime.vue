<template lang="html">
	<div>
		<input v-model="date" type="date" />
		<input v-model="time" type="time" />
	</div>
</template>

<script>
	import dateFormat from 'dateformat';

	export default {
		name: 'DateTime',
		props: {
			value: {
				default: null,
				type: [Number, String]
			}
		},
		computed: {
			date: {
				get () {
					if (this.value) return dateFormat(this.value, 'yyyy-mm-dd');

					return null;
				},
				set (val) {
					const newValue = `${val} ${this.time}:00`;
					this.$emit('input', newValue);
				}
			},
			time: {
				get () {
					if (this.value) return dateFormat(this.value, 'HH:MM');

					return null;
				},
				set (val) {
					const newValue = `${this.date} ${val}:00`;
					this.$emit('input', newValue);
				}
			}
		}
	};
</script>
