import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

export default defineConfig({
  name: "default",
  title: "Yaleika · Portafolio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenido")
          .items([
            S.listItem()
              .title("Proyectos con Simplify")
              .child(
                S.documentList()
                  .title("Proyectos con Simplify")
                  .filter('_type == "project" && kind == "simplify"')
                  .defaultOrdering([{ field: "order", direction: "asc" }])
                  .initialValueTemplates([S.initialValueTemplateItem("project-simplify")]),
              ),
            S.listItem()
              .title("Proyectos independientes")
              .child(
                S.documentList()
                  .title("Proyectos independientes")
                  .filter('_type == "project" && kind == "independiente"')
                  .defaultOrdering([{ field: "order", direction: "asc" }])
                  .initialValueTemplates([S.initialValueTemplateItem("project-independiente")]),
              ),
            S.divider(),
            S.documentTypeListItem("article").title("Blog · Artículos"),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev.filter((t) => t.schemaType !== "project"),
      { id: "project-simplify", title: "Proyecto con Simplify", schemaType: "project", value: { kind: "simplify" } },
      { id: "project-independiente", title: "Proyecto independiente", schemaType: "project", value: { kind: "independiente" } },
    ],
  },
});
