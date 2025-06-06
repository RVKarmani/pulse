import { Node } from "unist-builder";

export interface UnistNode extends Node {
  type: string;
  name?: string;
  tagName?: string;
  value?: string;
  attributes?: {
    name: string;
    value: unknown;
    type?: string;
  }[];
  properties?: {
    __src__?: string;
    __npmCommand__?: string;
    __yarnCommand__?: string;
    __pnpmCommand__?: string;
    __bunCommand__?: string;
    className?: string[];
  };
  children?: UnistNode[];
}

export interface UnistTree extends Node {
  type: "root";
  children: UnistNode[];
}

export interface NpmCommands {
  __npmCommand__?: string;
  __yarnCommand__?: string;
  __pnpmCommand__?: string;
  __bunCommand__?: string;
}
