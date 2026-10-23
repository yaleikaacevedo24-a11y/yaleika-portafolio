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
              .title("Mis proyectos de e-commerce")
              .child(
                S.documentList()
                  .title("Mis proyectos de e-commerce")
                  .filter('_type == "project" && kind == "simplify"')
                  .defaultOrdering([{ field: "order", direction: "asc" }])
                  .initialValueTemplates([S.initialValueTemplateItem("project-simplify")]),
              ),
            S.listItem()
              .title("Mis proyectos")
              .child(
                S.documentList()
                  .title("Mis proyectos")
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
      { id: "project-simplify", title: "Proyecto de e-commerce", schemaType: "project", value: { kind: "simplify" } },
      { id: "project-independiente", title: "Mi proyecto", schemaType: "project", value: { kind: "independiente" } },
    ],
  },
});
