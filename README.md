# Cloudflare Route Tracker

This repository is a CloudFlare worker that tracks how many times a route has been accessed. It uses CloudFlare's Workers KV to store the data and returns the number of times a route has been accessed as a Shield.io badge. All routes are case-insensitive. To use this worker, embed the below URL in your markdown or HTML as an image:

```
https://cloudflare-route-tracker.oolunar.workers.dev/<your-route-here>
```

| Query Parameter | Description |
|-----------------|-------------|
| `add`           | Locally appends the number to the route. Will not modify the actual route hit count. |
| `color`         | The color of the left side of the shield. |
| `label`         | The label to display on the shield. |
| `labelColor`    | The color of the label. |
| `links`         | A Javascript array supporting up to two links. |
| `logo`          | Can either be a base64 encoded image or a [simple-icons](https://simpleicons.org/) slug. |
| `logoColor`     | The color of the logo. Either a hex color or a CSS color. |
| `style`         | The style of the shield. Can be either `flat`, `flat-square`, `for-the-badge`, `social`, or `plastic`. |