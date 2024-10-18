import { merge } from "lume/core/utils/object.ts";
import Site from "lume/core/site.ts";
import Parser from "npm:rss-parser";
import { convert } from "npm:html-to-text";

/**
 * Options for the openring plugin
 */
export interface Options {
  /**
   * Number of articles that should be fetched per source
   */
  perSource: number;

  /**
   * Array of RSS/Atom feed links that should be fetched from
   */
  sources: string[];

  /**
   * Name of the key that the plugin should put the articles in the site data
   */
  dataKey: string;

  /**
   * Name of the key to save source information to (boolean false to disable)
   */
  sourceKey: boolean | string;

  /**
   * Options for the `html-to-text` npm package
   */
  htmlToText: object;
}

/**
 * Data structure for an article fetched by the plugin
 */
export interface Article {
  /**
   * The date of the article
   */
  date?: string;

  /**
   * The URL of the article
   */
  url?: string;

  /**
   * The title of the article
   */
  title?: string;

  /**
   * The content of the article. If a summary is present in the feed it is preferred over the actual
   * content of the post.
   */
  content?: string;

  /**
   * The URL of the feed source
   */
  sourceUrl?: string;

  /**
   * The title of the feed source
   */
  sourceTitle?: string;
}

export interface Source {
  /**
   * The title of the source
   */
  title?: string;

  /**
   * The URL of the source
   */
  url?: string;
}

const parser = new Parser();

const defaultOptions: Options = {
  perSource: 1,
  sources: [],
  dataKey: "openring",
  sourceKey: "openringSources",
  htmlToText: {
    selectors: [
      { selector: "a", format: "inline" },
      { selector: "img", format: "skip" },
      { selector: "picture", format: "skip" },
    ],
  },
};

/**
 * A plugin to fetch a set number of articles from configured
 * RSS/Atom feed sources.
 */
export default function (userOptions: Partial<Options>) {
  const options = merge(defaultOptions, userOptions);

  return (site: Site) => {
    site.addEventListener("beforeBuild", async () => {
      const articles: Article[] = [];
      const sources: Source[] = [];

      for (const source of options.sources) {
        try {
          console.log(`📡 Fetching ${source}`);
          const feed = await parser.parseURL(source);
  
          articles.push(...getItemsFromFeed(feed, options));
          sources.push(getSourceFromFeed(feed));
        }
        catch (err: unknown) {
          const e = err as Error;
          console.log(`❌ Failed fetching ${source}: ${e.message}`);
        }
      }

      site.data(options.dataKey, articles);

      if (options.sourceKey) {
        site.data(<string> options.sourceKey, sources);
      }
    });
  };
}

/**
 * Method to fetch items from a feed source
 *
 * @param source - The source feed URL
 * @param options - The plugin options object
 * @returns A promise resolving a list of article items
 */
function getItemsFromFeed(
  feed: Parser.Output<{ [key: string]: any }>,
  options: Options,
): Article[] {
  const articles: Article[] = [];

  for (const item of feed.items) {
    articles.push({
      title: item.title,
      url: item.link,
      date: item.pubDate,
      content: convert(item.summary, options.htmlToText) ||
        convert(item.content, options.htmlToText),
      sourceTitle: feed.title,
      sourceUrl: feed.link,
    });

    if (articles.length >= options.perSource) {
      break;
    }
  }

  return articles;
}

function getSourceFromFeed(
  feed: Parser.Output<{ [key: string]: any }>,
): Source {
  return {
    title: feed.title,
    url: feed.link,
  };
}
