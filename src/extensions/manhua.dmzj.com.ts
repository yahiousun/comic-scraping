import { EvalWorker } from '../eval-worker';
import { ComicObject } from '../types/index';

// Comic base url
const BASE = 'http://manhua.dmzj.com/';
// Image CDN base url
const IMAGE_BASE = 'http://images.dmzj.com/';

let sandbox;

namespace extension {
  export const name = 'manhua.dmzj.com';
  export const regex = /^https?:\/\/manhua.dmzj.com\/[\w]+\/[\d]+.shtml/;
  export function available(url: string): boolean {
    return regex.test(url);
  }
  export async function scrape(url: string): Promise<ComicObject> {
    if (!available(url)) {
      return Promise.reject('');
    }
    return fetch(url)
      .then(res => res.text())
      .then(text => parse(text));
  }
  // export async function list() {}
  export async function parse(input: string): Promise<ComicObject> {
    // preprocess input
    const htmlString = input.replace(/\n/g, '');

    if (!htmlString) {
      return Promise.reject('');
    }

    // prepare sandbox environment
    if (!sandbox) {
      sandbox = new EvalWorker();
    }

    const title = htmlString.match(/var\sg_comic_name\s=\s"(.*?)";/)[1];
    const subtitle = htmlString.match(/var\sg_chapter_name\s=\s"(.*?)";/)[1];
    // e.g. var g_comic_url = "qishimofa/";
    const seriesLink = htmlString.match(/var\sg_comic_url\s=\s"(.*?)";/)[1];
    // e.g. var g_chapter_url = "qishimofa/67047.shtml";
    const link = htmlString.match(/var\sg_chapter_url\s=\s"(.*?)";/)[1];
    const evalString  = htmlString.match(/page\s=\s'';\s*(.+?)\s*;\s*var\sg_comic_name/)[1];

    if (!title || !subtitle) {
      return Promise.reject('');
    }

    return sandbox.eval(`${evalString} ; eval(pages);`).then((result) => {
      if (result.length) {
        const pages = result.map((item) => {
          return IMAGE_BASE + item;
        });

        const comic: ComicObject = {
          title: `${title} ${subtitle}`,
          link: BASE + link,
          pages,
        };

        if (seriesLink) {
          comic.series = {
            title: title,
            link: BASE + seriesLink
          };
        }
        return comic;
      }
      throw new Error('Comic Not Found');
    });
  }
}

export default extension;
