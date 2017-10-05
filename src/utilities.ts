import { default as extensions } from './extensions';

export function available(href: string): string {
  const url = new URL(href);
  if (Object.prototype.hasOwnProperty.call(extensions, url.host)) {
    return extensions[url.host].available(href) ? url.host : '';
  }
  return '';
}

export function url2module(url: string) {
  const name = available(url);
  if (name) {
    return extensions[name];
  }
  return;
}
