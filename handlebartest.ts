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
  public dbChanges: boolean = false;
  public assemblies: Array<object> = [];
}

const output = "HelloWorld.md";

let hbs = Handlebars.create();
let helpers = require("handlebars-helpers")({
  handlebars: hbs,
});

const source = `
{{#forEach (getMigrations commits)}}
{{#if isFirst}}### Die DB-Scripts befinden sich unter DbScripts:{{/if}}
- {{this.migration}}
{{else}}
### Es sind keine Datenbank Anpassungen erforderlich.
{{/forEach}}
# Global list of CS ({{commits.length}})
{{#forEach commits}}
{{#if isFirst}}### Associated commits{{/if}}
* **ID{{this.id}}**
   -  **Message:** {{this.message}}
   -  **Commited by:** {{this.author.displayName}}
   -  **Changed files count:** {{this.changes.length}}
{{/forEach}}
{{#forEach (assemblies commits)}}
{{#if isFirst}}### Changed Assemblies:{{/if}}
  - **{{this.assembly}}**
{{/forEach}}
{{#forEach (distinctFiles commits)}}
{{#if isFirst}}### Associated changed files{{/if}}
  -  **File path:** {{this.path}}
{{/forEach}}`;

let data = new Root();

data.commits = [
  new Commit({
    id: "34",
    author: new Author({ displayName: "Marco" }),
    message: "[DevOps] whatever",
    changes: [
      new Change({
        item: new ChangeItem({
          path:
            "$/ffm.Playground/Nexus.Shared/1.21.x/Modules.Cpoe/Trunk/src/Laboratory.Core/FlalavLabvalues.cs",
        }),
      }),
    ],
  }),
  new Commit({
    id: "32",
    author: new Author({ displayName: "Marco" }),
    message: "[DevOps] whichever",
    changes: [
      new Change({
        item: new ChangeItem({
          path:
            "$/ffm.Playground/Nexus.Shared/1.21.x/Modules.Cpoe/Trunk/src/Laboratory.Core/FlalavLabvalues.cs",
        }),
      }),
    ],
  }),
  new Commit({
    id: "35",
    author: new Author({ displayName: "Marco" }),
    message: "changed unieuq constraints",
    changes: [
      new Change({
        item: new ChangeItem({
          path:
            "$/ffm.Playground/Nexus.Shared/1.21.x/Modules.Cpoe/Trunk/DbScripts/SqlServerNG/nexus_ng/CreateDB/Structure/fpoctp_t_cpoe_templates.tab",
        }),
      }),
    ],
  }),
  new Commit({
    id: "37",
    author: new Author({ displayName: "Marco" }),
    message: "added new migration",
    changes: [
      new Change({
        item: new ChangeItem({
          path:
            "$/ffm.Playground/Nexus.Shared/1.21.x/Modules.Cpoe/Trunk/DbScripts/OracleNG/nexus_ng/Migration/Structure/20200212_162150_fpocty.tab.mod",
        }),
      }),
    ],
  }),
  new Commit({
    id: "38",
    author: new Author({ displayName: "Marco" }),
    message: "small chane on migration",
    changes: [
      new Change({
        item: new ChangeItem({
          path:
            "$/ffm.Playground/Nexus.Shared/1.21.x/Modules.Cpoe/Trunk/DbScripts/OracleNG/nexus_ng/Migration/Structure/20200212_162150_fpocty.tab.mod",
        }),
      }),
    ],
  }),
];

hbs.registerHelper("assemblies", function (
  commits: Array<Commit>
): Array<object> {
  const allChanges = commits.reduce(
    (cs: Array<Change>, c) => [...cs, ...c.changes],
    []
  );
  const srcChanges = allChanges
    .filter((cs) => cs.item.path.includes("/Trunk/src/"))
    .map((c) => c.item.path.split("/Trunk/src/")[1].split("/")[0])
    .filter((s) => s.includes("."))
    .map((a) => "Nexus.Shared.Modules." + a + ".dll");

  const distinct = [...new Set(srcChanges)];

  return distinct.map((s) => ({ assembly: s }));
});

hbs.registerHelper("distinctFiles", function (
  commits: Array<Commit>
): Array<object> {
  const allChanges = commits.reduce(
    (cs: Array<Change>, c) => [...cs, ...c.changes],
    []
  );
  const srcChanges = allChanges.map(
    (c) => c.item.path.split("/Modules.Cpoe/")[1]
  );
  const distinct = [...new Set(srcChanges)];
  return distinct.map((s) => ({ path: s }));
});

hbs.registerHelper("hasDbScripts", function (commits: Array<Commit>): boolean {
  const allChanges = commits.reduce(
    (cs: Array<Change>, c) => [...cs, ...c.changes],
    []
  );
  return allChanges.some((cs) => cs.item.path.includes("nexus_ng/Migration"));
});

hbs.registerHelper("getMigrations", function (
  commits: Array<Commit>
): Array<object> {
  const allChanges = commits.reduce(
    (cs: Array<Change>, c) => [...cs, ...c.changes],
    []
  );
  const migrations = allChanges
    .filter((cs) => cs.item.path.includes("nexus_ng/Migration"))
    .map((c) => c.item.path.split("/Trunk/")[1]);
  const distinct = [...new Set(migrations)];
  return distinct.map((s) => ({ migration: s }));
});

let template = hbs.compile(source);
const result = template(data);

writeFile(output, result, function (err) {
  if (err) return console.log(err);
});
