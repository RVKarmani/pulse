import { INavigationConfig } from "@/types";

const componentsRoute = "/docs/components";
const utilsRoute = "/docs/utils";

export const navConfig: INavigationConfig = {
  topNavItems: [
    { title: "Documentation", href: "/docs" },
    { title: "Components", href: `${componentsRoute}/button` },
    { title: "Blogs", href: "/blogs" },
  ],
  sideNavItems: [
    {
      title: "Getting Started",
      children: [
        { title: "Introduction", href: "/docs", tag: "Updated" },
        {
          title: "Installation",
          href: "/docs/install",
          tag: "New",
        },
      ],
    },
    {
      title: "Components",
      children: [
        { title: "Accordion", href: `${componentsRoute}/accordion` },
        { title: "Alert", href: `${componentsRoute}/alert` },
        { title: "Avatar", href: `${componentsRoute}/avatar` },
        { title: "Badge", href: `${componentsRoute}/badge` },
        { title: "Breadcrumb", href: `${componentsRoute}/breadcrumb` },
        { title: "Button", href: `${componentsRoute}/button` },
        { title: "Card", href: `${componentsRoute}/card` },
        { title: "Checkbox", href: `${componentsRoute}/checkbox` },
        { title: "Dialog", href: `${componentsRoute}/dialog` },
        { title: "Input", href: `${componentsRoute}/input` },
        { title: "Label", href: `${componentsRoute}/label`, tag: "New" },
        { title: "Menu", href: `${componentsRoute}/menu` },
        {
          title: "Popover",
          href: `${componentsRoute}/popover`,
          tag: "New",
        },
        { title: "Progress", href: `${componentsRoute}/progress` },
        { title: "Radio", href: `${componentsRoute}/radio` },
        { title: "Select", href: `${componentsRoute}/select` },
        { title: "Slider", href: `${componentsRoute}/slider`, tag: "New" },
        {
          title: "Sonner",
          href: `${componentsRoute}/sonner`,
          tag: "New",
        },
        { title: "Switch", href: `${componentsRoute}/switch` },
        { title: "Tab", href: `${componentsRoute}/tab` },
        { title: "Textarea", href: `${componentsRoute}/textarea` },
        { title: "Text", href: `${componentsRoute}/text` },
        {
          title: "Toggle",
          href: `${componentsRoute}/toggle`,
          tag: "New",
        },
        {
          title: "Toggle Group",
          href: `${componentsRoute}/toggle-group`,
          tag: "New",
        },
        {
          title: "Tooltip",
          href: `${componentsRoute}/tooltip`,
          tag: "New",
        },
      ],
    },
    {
      title: "Utilities",
      children: [{ title: "cn", href: `${utilsRoute}/cn` }],
    },
  ],
};
