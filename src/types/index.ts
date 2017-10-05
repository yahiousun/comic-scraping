export interface LinkObject {
  title: string;
  link: string;
}

export interface ComicObject {
  series?: LinkObject;
  title: string;
  link: string;
  pages: Array<string>;
  previous?: LinkObject;
  next?: LinkObject;
}
