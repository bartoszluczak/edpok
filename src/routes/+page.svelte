<script lang="ts">
	function getDateFromJsDateString() {
		return this.toISOString().slice(0, 10);
	}

	function replaceAndReverse(replace: string, replaceWith: string, reverse: boolean = true) {
		let arr = this.split(replace);
		if (reverse) {
			arr = arr.reverse();
		}
		let joined = arr.join(replaceWith);
		return this.replace(this, joined);
	}

	Date.prototype.getFullDate = getDateFromJsDateString;
	String.prototype.replaceAndReverse = replaceAndReverse;

	export let data;
	const listOfDates: string[] = [];
	const today = new Date().getFullDate();
	let selectedDate = '';
	let mainArticle: any;
	let imgElement;
	let isImgSmall;

	data.articles.forEach((article) => {
		const articleDate = new Date(article.created_at).getFullDate();
		listOfDates.unshift(articleDate.replaceAndReverse('-', '/', true));
	});

	$: selectedDate && changeArticle();

	const changeArticle = () => {
		mainArticle = data.articles.find((article) => {
			const articleDate = new Date(article.created_at).getFullDate();
			if (selectedDate.length > 0) {
				return articleDate === selectedDate.replaceAndReverse('/', '-', true);
			} else {
				selectedDate = today.replaceAndReverse('-', '/', true);
				return articleDate === today;
			}
		});
	};

	const formatArticleDate = (date: string) => {
		return new Date(date).getFullDate().replaceAndReverse('-', '/', true);
	};

	changeArticle();
</script>

<svelte:head>
	<title>Everyday piece of knowledge</title>
	<meta name="description" content="Learn something new everyday" />
</svelte:head>

<section>
	<div class="historyDatesContainer">
		<h4>History of articles</h4>
		<div class="historyInnerContainer">
			<h5>Today</h5>
			<ul>
				{#each listOfDates as date}
					<li class:is-active={selectedDate === date} on:click={() => (selectedDate = date)}>
						<div class="timeline" class:active={selectedDate === date} />
						{date}
					</li>
				{/each}
			</ul>
			<h5>Past</h5>
		</div>
		<a href="https://www.buymeacoffee.com/bluczak" target="_blank"
			><img
				src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
				alt="Buy Me A Coffee"
				style="height: 60px !important;width: 217px !important;"
			/></a
		>
	</div>
	<div class="articleContainer">
		{#if mainArticle}
			<div class="contentHeader">
				<h2>{mainArticle.title}</h2>
				<p>{formatArticleDate(mainArticle.created_at)}</p>
			</div>
			<div class="articleImage">
				<img
					src={mainArticle.image}
					alt="Image for article"
					bind:this={imgElement}
					on:load={() => (isImgSmall = imgElement.height <= 512)}
					class:withoutHeight={isImgSmall}
				/>
			</div>
			<div class="content">
				{@html mainArticle.content}
			</div>
		{:else}
			<div class="article-not-found">
				<h1 class="sad-face-icon">;(</h1>
				<p>Sorry We don't have any article for You today</p>
				<p>Please come back tomorrow</p>
			</div>
		{/if}
	</div>
</section>

<style lang="scss">
	* {
		color: rgba(255, 255, 255, 0.9);
	}

	@media (max-width: 966px) {
		section {
			flex-wrap: wrap !important;
		}

		.articleContainer {
			order: 1;
		}

		.historyDatesContainer {
			order: 2;
			width: 80vw !important;
			border: 1px solid rgba(248, 248, 255, 0.3) !important;
			border-radius: 1rem !important;
			padding: 1rem !important;
			backdrop-filter: blur(5rem);
			background: rgb(255, 255, 255) !important;
			background: linear-gradient(
				180deg,
				rgba(255, 255, 255, 0.1) 0%,
				rgba(255, 255, 255, 0) 100%
			) !important;
		}
	}

	section {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: center;
		flex: 0.6;
		height: 100%;
		margin-top: 2rem;
		gap: 2rem;
	}

	.historyDatesContainer {
		border-right: 1px solid rgba(248, 248, 255, 0.3);
		padding: 0 1rem 1rem 1rem;
		width: 20vw;
		display: flex;
		flex-direction: column;
		justify-content: start;

		h4,
		li {
			color: rgba(248, 248, 255, 0.4);
		}
	}

	.historyDatesContainer h4 {
		padding: 0;
		margin: 0;
	}

	.articleContainer {
		width: 80vw;
		padding: 1rem;
		box-sizing: content-box;
		text-align: justify;
		border: 1px solid rgba(255, 255, 255, 0.1411764706);
		border-radius: 1rem;
		backdrop-filter: blur(5rem);
		background: rgb(255, 255, 255);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
	}

	.contentHeader {
		margin-bottom: 2em;
	}

	.articleContainer h2 {
		padding: 0;
		margin: 0;
		font-size: 2.5rem;
		text-align: left;
	}
	.articleContainer p {
		padding: 0;
		margin: 0;
		font-size: 0.9rem;
		color: grey;
	}

	.articleImage {
		display: flex;
		overflow: hidden;
		align-items: center;
		justify-content: center;
		border-radius: 1rem;

		img {
			width: 100%;
		}
	}

	.articleImage:has(img.withoutHeight) {
		height: unset !important;
	}

	.content {
		max-width: 100%;
		line-break: normal;
		word-break: keep-all;
	}
	ul {
		text-indent: 0;
		text-decoration: none;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		padding: 0.1rem 0 0.1rem 0;
		cursor: pointer;
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.5rem;
	}

	.article-not-found {
		text-align: center;
		h1 {
			font-size: 5rem;
		}
	}

	li.is-active {
		color: white;
	}

	.timeline {
		height: 3px;
		background-color: rgba(255, 255, 255, 0.5);
		display: block;
		width: 15px;
		border-radius: 1rem;
		transition: 500ms;
	}

	.active {
		background-color: white;
		width: 30px;
	}
</style>
