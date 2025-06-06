import { componentConfig } from "@/config";
import { TabGroup, TabList, TabPanels, TabPanel, Tab } from "@headlessui/react";
import React, { HTMLAttributes } from "react";
import { Button } from "./retroui";

interface IComponentShowcase extends HTMLAttributes<HTMLDivElement> {
  name: keyof typeof componentConfig.examples;
}

export function ComponentShowcase({ name, children }: IComponentShowcase) {
  const { preview: Preview } = componentConfig.examples[name];
  const Code = React.Children.toArray(children)[0];

  return (
    <TabGroup>
      <TabList className="space-x-4 border-b mb-6 text-sm">
        <Tab className="min-w-12 cursor-pointer relative px-2 py-1 bg-transparent data-selected:border data-selected:border-b-0 data-selected:bg-black data-selected:text-white focus:outline-hidden">
          Preview
        </Tab>
        <Tab className="min-w-12 cursor-pointer relative px-2 py-1 bg-transparent data-selected:border data-selected:border-b-0 data-selected:bg-black data-selected:text-white focus:outline-hidden">
          Code
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="border rounded-sm px-6 py-24 flex justify-center items-center min-h-80 mt-4 relative">
            <a
              href={`https://v0.dev/chat/api/open?url=https://retroui.dev/r/${name}.json`}
              target="_blank"
            >
              <Button
                variant="secondary"
                size="sm"
                className="font-sans absolute top-4 right-4"
              >
                Open in
                <svg
                  viewBox="0 0 40 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2 text-current"
                >
                  <path
                    d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </Button>
            </a>

            <Preview />
          </div>
        </TabPanel>
        <TabPanel>
          <div className="relative rounded-sm overflow-auto">{Code}</div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
