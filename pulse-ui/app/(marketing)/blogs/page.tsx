import { allBlogs } from "@/.contentlayer/generated";
import { Card, Text } from "@/components/retroui";
import Image from "next/image";
import Link from "next/link";
import React from "react";

function page() {
  const blogs = allBlogs.filter((blog) => blog.status === "published");

  return (
    <div>
      <Text as="h2" className="mb-12 text-center ">
        All RetroUI Blogs
      </Text>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {blogs.map((blog) => (
          <Link href={`${blog.url}`} key={blog._id}>
            <Card>
              <Card.Header>
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  width={600}
                  height={400}
                  className="mb-6"
                />
                <Card.Title>{blog.title}</Card.Title>
                <Card.Description>{blog.description}</Card.Description>
              </Card.Header>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default page;
