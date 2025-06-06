"use client";

import { Alert, Badge, Card, Text } from "@/components/retroui";
import { useMDXComponent } from "next-contentlayer/hooks";
import React, { AnchorHTMLAttributes, HTMLAttributes } from "react";
import { ComponentShowcase } from "./ComponentShowcase";
import { cn } from "@/lib/utils";
import { ComponentSource } from "./ComponentSource";
import { CodeBlock } from "./CodeBlock";
import Link from "next/link";
import { ComponentInstall, CliCommand } from "./ComponentInstall";
import Image from "next/image";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

const components = (type: "doc" | "blog") => ({
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Text as="h1" {...props} />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) =>
    type === "blog" ? (
      <Text as="h2" className="mb-4 mt-8" {...props} />
    ) : (
      <Text as="h2" className="border-b pb-1 mb-6" {...props} />
    ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Text as="h3" className="mb-4" {...props} />
  ),
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <Text as="h4" className="mb-2" {...props} />
  ),
  h5: (props: HTMLAttributes<HTMLHeadElement>) => <Text as="h5" {...props} />,
  h6: (props: HTMLAttributes<HTMLHeadElement>) => <Text as="h6" {...props} />,
  p: (props: HTMLAttributes<HTMLHeadElement>) =>
    type === "blog" ? (
      <Text {...props} className="text-lg text-zinc-600" />
    ) : (
      <Text {...props} />
    ),
  li: (props: HTMLAttributes<HTMLHeadElement>) =>
    type === "blog" ? (
      <Text
        as="li"
        {...props}
        className="text-lg text-zinc-600 ml-4 lg:ml-8 mb-2"
      />
    ) : (
      <Text as="li" {...props} />
    ),
  img: (props: HTMLAttributes<HTMLImageElement>) => (
    <img className="mx-auto w-full max-w-[600px] my-8" {...props} />
  ),
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const { href, target, rel, ...rest } = props;

    if (!href) {
      return <a {...rest} />;
    }

    const isExternal = href.startsWith("http");

    return isExternal ? (
      <a
        href={href}
        target={target || "_blank"}
        rel={rel || "noopener noreferrer"}
        className="underline underline-offset-4 hover:decoration-primary"
        {...rest}
      />
    ) : (
      <Link
        href={href}
        className="underline underline-offset-4 hover:decoration-primary"
        {...rest}
      />
    );
  },
  pre: CodeBlock,
  code: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded-sm bg-[#282A36] p-1 text-primary text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  ),
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Link,
  Badge,
  Image,
  Card,
  Alert,
  ComponentShowcase,
  ComponentSource,
  ComponentInstall,
  CliCommand,
});

export default function MDX({
  code,
  type = "doc",
}: {
  code: string;
  type?: "doc" | "blog";
}) {
  const Content = useMDXComponent(code);

  return <Content components={components(type)} />;
}
