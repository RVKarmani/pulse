"use server";

import { Text } from "@/components/retroui";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Footer from "@/components/footer";
import SourceStats from "@/components/SourceStats";
import LLMSearch from "@/components/LLMSearch";

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
              Trace the <span className="text-outlined">Pulse</span> of the world
            </Text>
            <p className="text-lg text-muted-foreground mb-8 mt-4">
              A real-time news analysis platform delivering lightning-fast updates, powered by an incremental query engine
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
          <div className="w-full lg:w-3/5">
            <Text as="h2">
              Fetching <span className="text-outlined">data</span> from
            </Text>
          </div>
          <br />
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
            <SourceStats />
          </div>
        </section>
      </div>

      <section className="container max-w-6xl mx-auto px-4 lg:px-0 flex justify-center items-center lg:gap-28 xl:gap-32 my-28">
        <Image
          alt="architecture"
          src="/images/pulse/pulse.svg"
          layout="responsive"
          width={1000}
          height={1000}
          className="h-full w-full"
        />
      </section>

      <section className="container max-w-6xl mx-auto px-4 lg:px-0 flex justify-center items-center lg:gap-28 xl:gap-32 my-28">
        <LLMSearch />
      </section>

      <section className="container max-w-6xl mx-auto px-4 lg:px-0 flex justify-center items-center lg:gap-28 xl:gap-32 my-28">
        <KnowledgeGraph />
      </section>
      <Footer />
    </main>
  );
}
