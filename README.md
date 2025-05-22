# Webmention Storage using Netlify Blobs

[Netlify Blobs](https://docs.netlify.com/blobs/overview/) storage that works with [webmention-handler](https://github.com/vandie/webmention-handler).

This project was built alongside [serverless-webmentions](https://github.com/benjifs/serverless-webmentions) so that you can host your own webmentions on Netlify. You can see a fully working sample at the [serverless-webmentions-example](https://github.com/benjifs/serverless-webmentions-example) repo.

## Installation
```sh
npm install webmention-handler-netlify-blobs --save
```

## Usage
```js
import BlobStorage from 'webmention-handler-netlify-blobs'
const storage = new BlobStorage({
	siteID: 'netlify-site-id',               // optional
	token: 'netlify-personal-access-token'   // optional
})
```

By default, `siteID` and `token` are not required as it will use your current site for your blobs. You can optionally
add those values if you have a specific `siteID` you would like to use or while developing locally. For the `token`
value, you need to create a [Netlify personal access token](https://app.netlify.com/user/applications#personal-access-tokens).

```js
import { WebmentionHandler } from 'webmention-handler'
const wmHandler = new WebmentionHandler({
	storage
})
```