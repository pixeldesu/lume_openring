# Lume Openring

A plugin that brings Drew DeVault's
[openring](https://git.sr.ht/~sircmpwn/openring) concept into
[Lume](https://lume.land) sites as a plugin. No need to run an additional tool
in your site building pipeline to achieve the same goal.

## Usage

To use the plugin, simply import it in your sites `_config.ts` like so:

```ts
import openring from "https://deno.land/x/lume_openring@1.0.0/mod.ts";
```

Just as with other plugins, you then pass the imported function into
`site.use()`, the most minimal version looking like this:

```ts
site.use(openring({
  sources: ["https://pixelde.su/blog/posts.rss"],
}));
```

When building your site, this then fetches one article per source and stores the
list of articles in the data variable `openring` in your site.

You can provide following options to the plugin:

- `sources`: An array of RSS/Atom feed sources
- `perSource`: A number of how many articles should be fetched per source
  (default: `1`)
- `dataKey`: Name of the key in which the articles should be saved in your site
  (default: `openring`)
- `htmlToText`: Options for the
  [`html-to-text` npm package](https://www.npmjs.com/package/html-to-text)
  (default: inline link text and remove images)

The list of articles returned by the plugin follows general site convention,
with some additional values:

- `title`: Title of the article
- `date`: Date of the article
- `url`: URL of the article
- `content`: Content of the article (if a `<summary>` is present in the feed it
  is preferred over actual `<content>`)
- `sourceTitle`: Title of the feed source
- `sourceUrl`: URL of the feed source

## Example

The section "Articles from blogs I read" below my posts on pixelde.su
([example post](https://pixelde.su/blog/retrospective-krile-starryeyes/),
[configuration](https://github.com/pixeldesu/pixelde.su/blob/main/_config.ts#L68-L76),
[layout implementation](https://github.com/pixeldesu/pixelde.su/blob/main/src/_includes/layouts/blog.njk#L36-L55))
