import path from "path";
import fs from "fs";
import {
  defineDocumentType,
  defineNestedType,
  makeSource,
} from "contentlayer/source-files";
import { visit } from "unist-util-visit";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { u } from "unist-builder";
import { UnistNode } from "./types/unist";
import { componentConfig } from "./config";

const Links = defineNestedType(() => {
  return {
    name: "Links",
    fields: {
      source: { type: "string", required: false },
      api_reference: { type: "string", required: false },
    },
  };
});

export const Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `docs/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    lastUpdated: { type: "date", required: true },
    links: {
      type: "nested",
      of: Links,
      required: false,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
  },
}));

const Author = defineNestedType(() => ({
  name: "Author",
  fields: {
    name: { type: "string", required: true },
    avatar: { type: "string", required: true },
    x: { type: "string", required: false },
    linkedin: { type: "string", required: false },
  },
}));

export const Blog = defineDocumentType(() => ({
  name: "Blog",
  filePathPattern: `blogs/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    coverImage: { type: "string", required: true },
    publishedAt: { type: "date" },
    author: { type: "nested", required: true, of: Author },
    tags: { type: "list", required: true, of: { type: "string" } },
    status: { type: "enum", options: ["draft", "published"], default: "draft" },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/${doc._raw.flattenedPath}`,
    },
  },
}));

export default makeSource({
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [
      rehypeSlug,

      () => (tree) => {
        visit(tree, (node: UnistNode) => {
          if (node.name === "ComponentSource" && node.attributes) {
            const name = getNodeAttributeByName(node, "name")
              ?.value as keyof typeof componentConfig.core;

            if (!name) {
              return null;
            }

            const component = componentConfig.core[name];
            const filePath = path.join(process.cwd(), component.filePath);
            const source = fs.readFileSync(filePath, "utf8");

            node.children?.push(
              u("element", {
                tagName: "pre",
                properties: {
                  __src__: filePath,
                },
                children: [
                  u("element", {
                    tagName: "code",
                    properties: {
                      className: ["language-tsx"],
                    },
                    children: [
                      {
                        type: "text",
                        value: source,
                      },
                    ],
                  }),
                ],
              }),
            );
          }

          if (node.name === "ComponentShowcase" && node.attributes) {
            const name = getNodeAttributeByName(node, "name")
              ?.value as keyof typeof componentConfig.examples;

            if (!name) {
              return null;
            }

            const component = componentConfig.examples[name];
            const filePath = path.join(process.cwd(), component.filePath);
            const source = fs.readFileSync(filePath, "utf8");

            node.children?.push(
              u("element", {
                tagName: "pre",
                properties: {
                  __src__: component.filePath,
                  __rawString__: source,
                },
                children: [
                  u("element", {
                    tagName: "code",
                    properties: {
                      className: ["language-tsx"],
                    },
                    children: [
                      {
                        type: "text",
                        value: source,
                      },
                    ],
                  }),
                ],
              }),
            );
          }
        });
      },
      [
        rehypePrettyCode as any,
        {
          theme: "dracula-soft",
        },
      ],
    ],
  },
  contentDirPath: "./content",
  documentTypes: [Doc, Blog],
});

const getNodeAttributeByName = (node: UnistNode, name: string) => {
  return node.attributes?.find((attribute) => attribute.name === name);
};
