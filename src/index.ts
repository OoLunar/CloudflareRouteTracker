/**
 * Route Counter Worker
 * Tracks request counts for specific routes and returns shields.io compatible badges
 */

export interface Env {
	ROUTE_COUNTER: KVNamespace;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {
			const url = new URL(request.url);
			let path = url.pathname;

			// Get the current count from KV
			let countKvValue = await env.ROUTE_COUNTER.get(path);
			if (countKvValue === null) {
				// If the key does not exist, initialize it to the base value from the query. If there's no query, default to 0.
				const query = url.searchParams.get('start');
				try {
					parseInt(query || '0');
				} catch {
					return new Response(
						JSON.stringify({ error: 'Invalid start value' }),
						{
							status: 400,
							headers: {
								'Cache-Control': 'no-cache',
								'Content-Type': 'application/json'
							}
						}
					);
				}

				countKvValue = query ? query : '0';
			}

			let count = parseInt(countKvValue);

			// Increment the count
			count++;

			// Trim trailing slashes from the path
			if (path.endsWith('/')) {
				path = path.slice(0, -1);
			}

			await env.ROUTE_COUNTER.put(path, count.toString());

			// Return JSON response for API requests
			return new Response(
				JSON.stringify({
					schemaVersion: 1,
					label: "Total Hits",
					message: count.toLocaleString(undefined),
				}),
				{
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Cache-Control': 'no-cache',
						'Content-Type': 'application/json'
					}
				}
			);
		} catch (error) {
			// Type guard for Error
			if (error instanceof Error) {
				return new Response(
					JSON.stringify({ error: error.message }),
					{
						status: 500,
						headers: {
							'Cache-Control': 'no-cache',
							'Content-Type': 'application/json'
						}
					}
				);
			}

			return new Response(
				JSON.stringify({ error: 'Unknown error occurred' }),
				{
					status: 500,
					headers: {
						'Cache-Control': 'no-cache',
						'Content-Type': 'application/json'
					}
				}
			);
		}
	},
} satisfies ExportedHandler<Env>;