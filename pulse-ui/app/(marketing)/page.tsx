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


const KnowledgeGraph = dynamic(() => import('@/components/KnowledgeGraph'), {
  ssr: false // disables SSR for this component
});

export default async function Home() {
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
              src="/images/pexels-fotios.jpg"
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
      <KnowledgeGraph/>

      <Footer />
    </main>
  );
}
