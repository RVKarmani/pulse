import React from "react";
import { allBlogs } from "contentlayer/generated";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import MDX from "@/components/MDX";
import { Avatar, Badge, Button, Text } from "@/components/retroui";
import { Metadata } from "next";
import { MoveRightIcon, MoveUpRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer";
interface IProps {
  params: { slug: string[] };
}

function getBlogParams({ params }: IProps) {
  const url = `/blogs/${params.slug}`;
  const blog = allBlogs.find((blog) => blog.url === url);

  if (!blog) {
    return null;
  }

  return blog;
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const blog = getBlogParams({ params });

  if (!blog) {
    return {
      title: "Not Found | Retro UI",
    };
  }

  return {
    title: `${blog.title} | RetroUI Blogs`,
    description: blog.description,
    openGraph: {
      images: blog.coverImage,
      title: `${blog.title} | RetroUI Blogs`,
    },
  };
}

export default function page({ params }: IProps) {
  const blog = getBlogParams({ params });

  if (!blog) {
    return notFound();
  }

  if (!blog.publishedAt || blog.status !== "published") {
    return notFound();
  }

  return (
    <div className="max-w-3xl mt-8 mx-auto">
      <div className="border-b border-black pb-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Text className="text-muted-foreground text-sm font-medium">
            {format(new Date(blog.publishedAt), "dd, MMMM yyyy")}
          </Text>
          <Text>|</Text>
          <div className="flex items-center gap-3">
            {blog.tags.map((tag) => (
              <Badge
                key={tag}
                size="sm"
                variant="surface"
                className={`bg-${
                  ["red", "green", "blue", "yellow", "purple", "pink"][
                    blog.tags.indexOf(tag) % 6
                  ]
                }-300`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Text as="h1" className="mb-2">
          {blog.title}
        </Text>
        <p className="text-lg text-muted-foreground  mb-8">
          {blog.description}
        </p>
        <Image
          src={blog.coverImage}
          alt={blog.title}
          width={1200}
          height={800}
          className="mb-8"
        />
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <Avatar>
              <Avatar.Image src={blog.author.avatar} alt={blog.author.name} />
              <Avatar.Fallback>{blog.author.name}</Avatar.Fallback>
            </Avatar>
            <div>
              <Text as="h5">{blog.author.name}</Text>
              {blog.author.linkedin && (
                <Link
                  href={`https://www.linkedin.com/in/${blog.author.linkedin}`}
                  target="_blank"
                  className="text-muted-foreground"
                >
                  @{blog.author.linkedin}
                </Link>
              )}
              {blog.author.x && (
                <Link
                  href={`https://x.com/@${blog.author.x}`}
                  target="_blank"
                  className="text-muted-foreground"
                >
                  @{blog.author.x}
                </Link>
              )}
            </div>
          </div>

          <Link
            target="_blank"
            href={`https://x.com/share?url=${
              "https://retroui.dev" + blog.url
            }&text=${blog.title}.%0ACheck it out 👉`}
          >
            <Button size="sm" variant="outline">
              Share on X
            </Button>
          </Link>
        </div>
      </div>
      <MDX code={blog.body.code} type="blog" />
    </div>
  );
}
