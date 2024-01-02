import { sql } from '@vercel/postgres';
import OpenAI from 'openai';
import 'dotenv/config';
import crypto from 'crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
	region: 'eu-central-1',
	credentials: {
		accessKeyId: process.env.accessKeyId,
		secretAccessKey: process.env.secretAccessKey
	}
});

export default async function handler(request, response) {
	try {
		const openai = new OpenAI({ apiKey: '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' });
		const { rows } = await sql`SELECT title from fullstackarticles LIMIT 30`;

		const articleList = rows.map((item) => item.title);

		const articleId = crypto.randomUUID();
		const createdAt = new Date().toISOString();

		console.log(articleList.join(','));

		// Call chatGPT
		const completion = await openai.chat.completions.create({
			messages: [
				{
					role: 'system',
					content: `You are a helpful assistant. who knows everything generate article with unique small piece of knowledge for
				fullstack developer with title, content and conclusions. format as an article and return a html,
				put the title in <h1></h1> tag. Here you have a list of all previous articles: ${articleList.join(
					','
				)} don't genereate article about the same topic.  Don't include any links.`
				}
			],
			model: 'gpt-3.5-turbo'
		});

		let articleContent;
		let articleCompletion = completion.choices[0].message.content;
		const articleTitle = articleCompletion.slice(
			articleCompletion.indexOf('<h1>') + 4,
			articleCompletion.indexOf('</h1>')
		);

		if (articleCompletion.includes('<body>')) {
			articleContent = articleCompletion.slice(
				articleCompletion.indexOf('<body>') + 6,
				articleCompletion.indexOf('</body>')
			);
		}

		articleContent = articleCompletion.replace(/<h1>(.*)<\/h1>/gm, '');

		while (articleContent.startsWith('\n')) {
			articleContent = articleContent.replace('\n', '');
		}

		const resp = await openai.images.generate({
			model: 'dall-e-3',
			prompt: `generate article illustration with the title ${articleTitle}`,
			n: 1,
			size: '1792x1024'
		});

		console.log(resp.data[0].url);

		const fetchResponse = await fetch(resp.data[0].url);
		const fetchBlob = await fetchResponse.arrayBuffer();
		// const fetchBlob = await fetchResponse.blob();

		const blob = await new PutObjectCommand({
			Bucket: 'articles-imgs',
			Key: `${articleId}.jpg`,
			Body: fetchBlob
		});
		const imgResponse = await client.send(blob);
		console.log(imgResponse['$metadata']);

		if (imgResponse['$metadata'].httpStatusCode !== 200) return;

		// const blob = await put(`./${articleId}.jpg`, fetchBlob, {
		// 	access: 'public'
		// });

		const articleImageUrl = `https://articles-imgs.s3.eu-central-1.amazonaws.com/${articleId}.jpg`;

		// 	Update DB
		await sql`INSERT INTO fullstackarticles (id, created_at, title, content, image) VALUES (${articleId}, ${createdAt}, ${articleTitle}, ${articleContent}, ${articleImageUrl})`;

		response.status(200).json({
			statusCode: 200,
			statusMsg: 'OK',
			createdAt,
			articleId,
			articleTitle,
			articleImageUrl,
			articleContent
		});
	} catch (error) {
		throw new Error(error);
	}
}
