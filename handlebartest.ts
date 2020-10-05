import { writeFile } from "fs";
import * as Handlebars from "handlebars";

class Author {
  public displayName: string = "";
  public constructor(init?: Partial<Author>) {
    Object.assign(this, init);
  }
}

class ChangeItem {
  public path: string = "";
  public constructor(init?: Partial<ChangeItem>) {
    Object.assign(this, init);
  }
}

class Change {
  public item: ChangeItem = new ChangeItem();
  public constructor(init?: Partial<Change>) {
    Object.assign(this, init);
  }
}

class Commit {
  public id: string = "";
  public message: string = "";
  public author: Author = new Author();
  public changes: Array<Change> = [];

  public constructor(init?: Partial<Commit>) {
    Object.assign(this, init);
  }
}

class Root {
  public commits: Array<Commit> = [];
}

const output = "HelloWorld.md";

let hbs = Handlebars.create();
let helpers = require("handlebars-helpers")({
  handlebars: hbs,
});

const source = `# Global list of CS ({{commits.length}})
{{#forEach commits}}
{{#if isFirst}}### Associated commits{{/if}}
* ** ID{{this.id}}**
   -  **Message:** {{this.message}}
   -  **Commited by:** {{this.author.displayName}}
   -  **Changed files count:** {{this.changes.length}}
{{/forEach}}
{{#forEach commits}}
{{#if isFirst}}### Associated changed files{{/if}}
{{#forEach this.changes}}
  -  **File path:** {{this.item.path}}
{{/forEach}}
{{/forEach}}`;

let template = hbs.compile(source);

let data = new Root();

data.commits = [
  new Commit({
    id: "34",
    author: new Author({ displayName: "Marco" }),
    message: "[DevOps] whatever",
    changes: [
      new Change({
        item: new ChangeItem({ path: "C:\\src\\trunk\\whatever" }),
      }),
    ],
  }),
  new Commit({
    id: "35",
    author: new Author({ displayName: "Marco" }),
    message: "changed unieuq constraints",
    changes: [
      new Change({
        item: new ChangeItem({ path: "C:\\src\\trunk\\whatever\\DbScripts" }),
      }),
    ],
  }),
];

let result = template(data);

writeFile(output, result, function (err) {
  if (err) return console.log(err);
});
