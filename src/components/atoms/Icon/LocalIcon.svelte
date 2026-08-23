<script lang="ts">
import Icon from "@iconify/svelte/dist/OfflineIcon.svelte";
import type { IconifyIcon } from "@iconify/types";

interface Props {
	icon: string;
	class?: string;
}

const publicationIcons: Record<string, IconifyIcon> = {
	"material-symbols:arrow-back-ios-new": {
		body: '<path fill="currentColor" d="M16 22L6 12L16 2l1.775 1.775L9.55 12l8.225 8.225z"/>',
	},
	"material-symbols:article-outline": {
		body: '<path fill="currentColor" d="M7 17h7v-2H7zm0-4h10v-2H7zm0-4h10V7H7zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z"/>',
	},
	"material-symbols:close": {
		body: '<path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"/>',
	},
	"material-symbols:format-list-bulleted": {
		body: '<path fill="currentColor" d="M9 19v-2h12v2zm0-6v-2h12v2zm0-6V5h12v2zM5 20q-.825 0-1.412-.587T3 18t.588-1.412T5 16t1.413.588T7 18t-.587 1.413T5 20m0-6q-.825 0-1.412-.587T3 12t.588-1.412T5 10t1.413.588T7 12t-.587 1.413T5 14M3.588 7.413Q3 6.825 3 6t.588-1.412T5 4t1.413.588T7 6t-.587 1.413T5 8t-1.412-.587"/>',
	},
	"material-symbols:restart-alt-rounded": {
		body: '<path fill="currentColor" d="M9.825 20.7q-2.575-.725-4.2-2.837T4 13q0-1.425.475-2.713t1.35-2.362q.275-.3.675-.313t.725.313q.275.275.288.675t-.263.75q-.6.775-.925 1.7T6 13q0 2.025 1.188 3.613t3.062 2.162q.325.1.538.375t.212.6q0 .5-.35.788t-.825.162m4.35 0q-.475.125-.825-.175t-.35-.8q0-.3.213-.575t.537-.375q1.875-.6 3.063-2.175T18 13q0-2.5-1.75-4.25T12 7h-.075l.4.4q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-2.1-2.1q-.15-.15-.212-.325T8.55 6t.063-.375t.212-.325l2.1-2.1q.275-.275.7-.275t.7.275t.275.7t-.275.7l-.4.4H12q3.35 0 5.675 2.325T20 13q0 2.725-1.625 4.85t-4.2 2.85"/>',
	},
	"material-symbols:search": {
		body: '<path fill="currentColor" d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/>',
	},
	"material-symbols:check": {
		body: '<path fill="currentColor" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"/>',
	},
	"material-symbols:link": {
		body: '<path fill="currentColor" d="M11 17H7q-2.075 0-3.537-1.463T2 12t1.463-3.537T7 7h4v2H7q-1.25 0-2.125.875T4 12t.875 2.125T7 15h4zm-3-4v-2h8v2zm5 4v-2h4q1.25 0 2.125-.875T20 12t-.875-2.125T17 9h-4V7h4q2.075 0 3.538 1.463T22 12t-1.463 3.538T17 17z"/>',
	},
	"material-symbols:download": {
		body: '<path fill="currentColor" d="m12 16l-5-5l1.4-1.45l2.6 2.6V4h2v8.15l2.6-2.6L17 11zm-6 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/>',
	},
	"fa7-solid:chevron-right": {
		body: '<path fill="currentColor" d="M12.6 12L8 7.4L9.4 6l6 6l-6 6L8 16.6z"/>',
	},
};

const { icon, class: className = "", width, height }: Props = $props();
const iconData = $derived(publicationIcons[icon]);
</script>

{#if iconData}
	<Icon icon={iconData} class={className} width={width} height={height} aria-hidden="true" />
{/if}
