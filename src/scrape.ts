import { default as extensions } from './extensions';
import { url2module } from './utilities';
import { ComicObject } from './types';

export async function scrape(url: string): Promise<ComicObject> {
  const module = url2module(url);
  if (module) {
    return module.scrape(url);
  }
  return Promise.reject('Module Not Found');
}
