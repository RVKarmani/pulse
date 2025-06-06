"use server";

import {
  Button,
  Text,
  Input,
  Textarea,
  Card,
  Avatar,
  Badge,
  CommandDisplay,
} from "@/components/retroui";
import AccordionStyleDefault from "@/preview/components/accordion-style-default";
import AlertStyleDefaultIcon from "@/preview/components/alert-style-with-icon";
import AvatarStyleCircle from "@/preview/components/avatar-style-circle-sizes";
import BadgeStyleVariants from "@/preview/components/badge-style-variants";
import dynamic from 'next/dynamic';
import {
  ArrowRightIcon,
  GithubIcon,
  HeartIcon,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer";
async function getContributors(): Promise<
  { avatar: string; username: string; url: string }[]
> {
  const request = await fetch(
    `https://api.github.com/repos/Logging-Stuff/RetroUI/contributors`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const contributorsList = await request.json();
  return [
    {
      avatar: "https://avatars.githubusercontent.com/u/58097221?v=4",
      username: "MeherabHossain007",
      url: "https://github.com/MeherabHossain007",
    },
    ...contributorsList.map(
      (c: { avatar_url: string; login: string; html_url: string }) => ({
        avatar: c.avatar_url,
        username: c.login,
        url: c.html_url,
      }),
    ),
  ];
}

const KnowledgeGraph = dynamic(() => import('@/components/KnowledgeGraph'), {
  ssr: false // ⛔ disables SSR for this component
});

export default async function Home() {
  const contributors = await getContributors();

  return (
    <main>
      <div className="bg-image bg-cover bg-no-repeat bg-center flex flex-col items-center h-[1900px] lg:h-[1400px]">
        <section className="container max-w-6xl mx-auto px-4 lg:px-0 text-gray-900 flex justify-center items-center lg:gap-28 xl:gap-32 my-28">
          <div className="text-center lg:text-left w-full lg:w-2/3">
            <Text as="h1" className="text-5xl text-foreground lg:text-6xl">
              Derive actionable insights from news
              <br />
              <span className="text-outlined"> in real-time!</span>
            </Text>

            <p className="text-lg text-muted-foreground mb-8 mt-4">
              RSS-based system built for processing news in real-time with incremental-query computation engine for blazing-fast updates
            </p>

          </div>
          <div className="hidden lg:block lg:w-1/3">
            <Image
              alt="orange cool cat"
              src="/images/tv_radio.png"
              layout="responsive"
              width={500}
              height={500}
              className="h-full w-full"
            />
          </div>
        </section>
        <section className="container max-w-6xl mx-auto px-4 lg:px-0 lg:my-36">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
            <Card className="w-full bg-background shadow-none">
              <Card.Header>
                <Card.Title>Button</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex flex-wrap gap-4">
                  <Button>Primary</Button>
                  <Button variant="outline">Outline</Button>
                </div>
              </Card.Content>
            </Card>
            <Card className="w-full bg-background shadow-none">
              <Card.Header>
                <Card.Title>Badge</Card.Title>
              </Card.Header>
              <Card.Content>
                <BadgeStyleVariants />
              </Card.Content>
            </Card>
            <Card className="w-full bg-background shadow-none">
              <Card.Header>
                <Card.Title>Avatar</Card.Title>
              </Card.Header>
              <Card.Content>
                <AvatarStyleCircle />
              </Card.Content>
            </Card>
            <Card className="w-full bg-background shadow-none">
              <Card.Header>
                <Card.Title>Accordion</Card.Title>
              </Card.Header>
              <Card.Content>
                <AccordionStyleDefault />
              </Card.Content>
            </Card>
            <Card className="w-full bg-background shadow-none">
              <Card.Header>
                <Card.Title>Input & Textarea</Card.Title>
              </Card.Header>
              <Card.Content>
                <Input />
                <div className="h-4"></div>
                <Textarea className="border-foreground" />
              </Card.Content>
            </Card>

            <Card className="w-full bg-background shadow-none">
              <Card.Header>
                <Card.Title>Alert</Card.Title>
              </Card.Header>
              <Card.Content>
                <AlertStyleDefaultIcon />
              </Card.Content>
            </Card>
          </div>
        </section>
      </div>

      <section className="container max-w-6xl mx-auto px-4 lg:px-0 flex flex-col lg:flex-row gap-12 lg:gap-16 lg:grid-cols-2 my-36">
        <div className="w-full lg:w-3/5">
          <Text as="h2">
            Easily <span className="text-outlined">Customize</span> to Your Own
            Needs! 🛠️
          </Text>
          <div className="flex flex-col space-y-1 mt-6 mb-8 text-muted-foreground">
            <Text className="text-lg">
              Copy-Paste Ready: Components that you can just copy paste.
            </Text>
            <Text className="text-lg">
              Tailwind Based: Customizable with Tailwind CSS.
            </Text>
            <Text className="text-lg">
              Type Safe: Typescript support for all components.
            </Text>
          </div>
          <Link href="/docs/components/button" passHref>
            <Button>See Examples</Button>
          </Link>
        </div>
        <div className="w-full lg:w-2/5">
          <Image
            src="/images/code_show.svg"
            width={600}
            height={400}
            alt="retroui code showcase"
          />
        </div>
      </section>

      <section className="container max-w-6xl mx-auto border-2 bg-primary border-black py-16 px-4 lg:p-16 my-36">
        <Text as="h2" className="text-center text-black mb-2">
          Community Contributors
        </Text>
        <Text className="text-xl text-center text-black mb-8">
          RetroUI core is free and open-source, and it is made possible by our
          awesome contributors.
        </Text>
        <div className="flex flex-wrap justify-center gap-2 lg:gap-4">
          {contributors.map((contributor) => (
            <Link
              key={contributor.username}
              href={contributor.url}
              target="_blank"
              passHref
              className="flex flex-col items-center"
            >
              <Avatar className="h-12 w-12 border-black lg:h-16 lg:w-16">
                <Avatar.Image
                  src={contributor.avatar}
                  alt={contributor.username}
                />
              </Avatar>
            </Link>
          ))}
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 mt-12">
          <Link
            href="https://github.com/logging-stuff/retroui"
            target="_blank"
            passHref
          >
            <Button
              className="bg-white border-black shadow-black text-black"
              variant="outline"
            >
              <GithubIcon size="16" className="mr-2" />
              Star on Github
            </Button>
          </Link>
          <Link href="https://discord.gg/Jum3NJxK6Q" target="_blank" passHref>
            <Button
              className="bg-white border-black shadow-black text-black"
              variant="outline"
            >
              <MessageCircle size="16" className="mr-2" />
              Join Community
            </Button>
          </Link>
        </div>
      </section>

      <KnowledgeGraph/>

      <Footer />
    </main>
  );
}
