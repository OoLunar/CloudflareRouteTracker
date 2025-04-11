import { Format, makeBadge } from 'badge-maker';

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
			let path = url.pathname.toLowerCase();

			// Trim trailing slashes from the path
			if (path.endsWith('/')) {
				path = path.slice(0, -1);
			}

			// Get the current count from KV
			let countKvValue = await env.ROUTE_COUNTER.get(path);
			let count = countKvValue ? parseInt(countKvValue) : 0;

			// Increment the count
			count++;
			await env.ROUTE_COUNTER.put(path, count.toString());

			// Test if there's an "add" query parameter for those who are importing this from another worker
			const add = url.searchParams.get('add');
			if (add) {
				const addCount = parseInt(add);
				if (!isNaN(addCount)) {
					count += addCount;
				}
			}

			// Test if the logo is not base64
			let logo = url.searchParams.get('logo');
			if (logo && !logo.startsWith('data:image/')) {
				logo = `https://cdn.simpleicons.org/${logo}/`;

				// Append the logo color if provided
				let logoColor = url.searchParams.get('logoColor');
				if (logoColor) {
					// Remove the # if it exists
					if (logoColor.startsWith('#')) {
						logoColor = logoColor.slice(1);
					}

					logo += logoColor;
				}

				// Scale
				logo += "?viewbox=auto"
			}

			let style: "flat" | "flat-square" | "for-the-badge" | "social" | "plastic" | undefined = undefined;
			switch (url.searchParams.get('style')) {
				case 'flat':
					style = 'flat';
					break;
				case 'flat-square':
					style = 'flat-square';
					break;
				case 'for-the-badge':
					style = 'for-the-badge';
					break;
				case 'social':
					style = 'social';
					break;
				default:
					style = 'plastic';
			}

			// Create the badge format
			const format: Format = {
				color: url.searchParams.get('color') || '#9f9f9f', // (Optional) Message color
				label: url.searchParams.get('label') || 'Total Hits', // (Required) Label text
				labelColor: url.searchParams.get('labelColor') || '#555', // (Optional) Label color
				links: JSON.parse(url.searchParams.get('links') || '["https://github.com/OoLunar/CloudflareRouteTracker/"]'), // (Optional) Array of links
				logoBase64: logo || '', // (Optional) Logo in base64 format
				message: count.toLocaleString(undefined), // (Required) Message text
				style: style
			};

			// Return JSON response for API requests
			return new Response(makeBadge(format), {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': 'no-cache',
					'Content-Type': 'image/svg+xml'
				}
			});
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