# Cloudflare Route Tracker

This repository is a CloudFlare worker that tracks how many times a route has been accessed. It uses CloudFlare's Workers KV to store the data and returns the number of times a route has been accessed in Shield.io's dynamic endpoint format. To use this worker, provide Shield.io the following URL, taking care to replace the variables with your own:

```
https://cloudflare-route-tracker.oolunar.workers.dev/<your-route-here>
```

Do take care to check if that route hasn't already been taken as there are no checks in place to prevent duplicate routes.