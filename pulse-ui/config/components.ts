import { lazy } from "react";

export const componentConfig: {
  core: {
    [key: string]: {
      name: string;
      filePath: string;
      dependencies?: string[];
      preview?: React.LazyExoticComponent<() => JSX.Element>;
    };
  };
} = {
  core: {
    accordion: {
      name: "accordion",
      dependencies: ["@radix-ui/react-accordion", "lucide-react"],
      filePath: "components/retroui/Accordion.tsx",
    },
    alert: {
      name: "alert",
      filePath: "components/retroui/Alert.tsx",
    },
    avatar: {
      name: "avatar",
      filePath: "components/retroui/Avatar.tsx",
    },
    badge: {
      name: "badge",
      filePath: "components/retroui/Badge.tsx",
    },
    button: {
      name: "button",
      filePath: "components/retroui/Button.tsx",
    },
    card: {
      name: "card",
      filePath: "components/retroui/Card.tsx",
    },
    checkbox: {
      name: "checkbox",
      filePath: "components/retroui/Checkbox.tsx",
    },
    dialog: {
      name: "dialog",
      filePath: "components/retroui/Dialog.tsx",
    },
    input: {
      name: "input",
      filePath: "components/retroui/Input.tsx",
    },
    label: {
      name: "label",
      filePath: "components/retroui/Label.tsx",
    },
    menu: {
      name: "menu",
      filePath: "components/retroui/Menu.tsx",
    },
    progress: {
      name: "progress",
      filePath: "components/retroui/Progress.tsx",
    },
    popover: {
      name: "popover",
      filePath: "components/retroui/Popover.tsx",
    },
    radio: {
      name: "radio",
      filePath: "components/retroui/Radio.tsx",
    },
    select: {
      name: "select",
      filePath: "components/retroui/Select.tsx",
    },
    switch: {
      name: "switch",
      filePath: "components/retroui/Switch.tsx",
    },
    slider: {
      name: "slider",
      dependencies: ["@radix-ui/react-slider"],
      filePath: "components/retroui/Slider.tsx",
    },
    sonner: {
      name: "sonner",
      filePath: "components/retroui/Sonner.tsx",
    },
    text: {
      name: "text",
      filePath: "components/retroui/Text.tsx",
    },
    toggle: {
      name: "toggle",
      filePath: "components/retroui/Toggle.tsx",
    },
    "toggle-group": {
      name: "toggle-group",
      filePath: "components/retroui/ToggleGroup.tsx",
    },
    tooltip: {
      name: "tooltip",
      filePath: "components/retroui/Tooltip.tsx",
    },
    breadcrumb: {
      name: "breadcrumb",
      filePath: "components/retroui/Breadcrumb.tsx",
    }
  },
};
