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
			const path = url.pathname;

			// Get the current count from KV
			let countKvValue = await env.ROUTE_COUNTER.get(path);
			let count = countKvValue ? parseInt(countKvValue) : 0;

			// Increment the count
			count++;
			env.ROUTE_COUNTER.put(path, count.toString());

			// Return JSON response for API requests
			return new Response(
				JSON.stringify({
					schemaVersion: 1,
					label: "Total Hits",
					message: count.toString(),
				}),
				{
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
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
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}

			return new Response(
				JSON.stringify({ error: 'Unknown error occurred' }),
				{
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}
	},
} satisfies ExportedHandler<Env>;