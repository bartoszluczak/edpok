// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
import { sql } from '@vercel/postgres';

export async function load() {
	const { rows } = await sql`SELECT id, created_at, title, content, image from fullstackarticles`;

	return {
		articles: rows
	};
}
