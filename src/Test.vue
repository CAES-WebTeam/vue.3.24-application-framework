<template lang="html">
	<div id="main">
		<button type="button" @click="helpMessage.show = true">
			Show Message
		</button>
		<ContextualHelpMessage
			v-if="helpMessage.show"
			:message-name="helpMessage.name"
			@close-modal="helpMessage.show = false"
		/>
	</div>
</template>

<script>
	import ContextualHelpMessage from '~/views/data/ContextualHelpMessage';

	export default {
		name: 'Test',
		components: {
			ContextualHelpMessage
		},
		data () {
			return {
				helpMessage: {
					show: false,
					name: 'NewReportScope'
				}
			};
		}
	};
</script>
