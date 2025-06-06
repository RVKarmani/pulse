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
  examples: {
    [key: string]: {
      name: string;
      filePath: string;
      preview: React.LazyExoticComponent<() => JSX.Element>;
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
  examples: {
    "accordion-style-default": {
      name: "accordion-style-default",
      filePath: "preview/components/accordion-style-default.tsx",
      preview: lazy(
        () => import("@/preview/components/accordion-style-default"),
      ),
    },
    "alert-style-default": {
      name: "alert-style-default",
      filePath: "preview/components/alert-style-default.tsx",
      preview: lazy(() => import("@/preview/components/alert-style-default")),
    },
    "alert-style-solid": {
      name: "alert-style-solid",
      filePath: "preview/components/alert-style-solid.tsx",
      preview: lazy(() => import("@/preview/components/alert-style-solid")),
    },
    "alert-style-with-icon": {
      name: "alert-style-with-icon",
      filePath: "preview/components/alert-style-with-icon.tsx",
      preview: lazy(() => import("@/preview/components/alert-style-with-icon")),
    },
    "alert-style-all-status": {
      name: "alert-style-all-status",
      filePath: "preview/components/alert-style-all-status.tsx",
      preview: lazy(
        () => import("@/preview/components/alert-style-all-status"),
      ),
    },
    "avatar-style-circle": {
      name: "avatar-style-circle",
      filePath: "preview/components/avatar-style-circle.tsx",
      preview: lazy(() => import("@/preview/components/avatar-style-circle")),
    },
    "avatar-style-circle-fallbacks": {
      name: "avatar-style-fallbacks",
      filePath: "preview/components/avatar-style-circle-fallbacks.tsx",
      preview: lazy(
        () => import("@/preview/components/avatar-style-circle-fallbacks"),
      ),
    },
    "avatar-style-circle-sizes": {
      name: "avatar-style-circle-sizes",
      filePath: "preview/components/avatar-style-circle-sizes.tsx",
      preview: lazy(
        () => import("@/preview/components/avatar-style-circle-sizes"),
      ),
    },
    "badge-style-default": {
      name: "badge-style-default",
      filePath: "preview/components/badge-style-default.tsx",
      preview: lazy(() => import("@/preview/components/badge-style-default")),
    },
    "badge-style-variants": {
      name: "badge-style-variants",
      filePath: "preview/components/badge-style-variants.tsx",
      preview: lazy(() => import("@/preview/components/badge-style-variants")),
    },
    "badge-style-rounded": {
      name: "badge-style-default",
      filePath: "preview/components/badge-style-rounded.tsx",
      preview: lazy(() => import("@/preview/components/badge-style-rounded")),
    },
    "badge-style-sizes": {
      name: "badge-style-sizes",
      filePath: "preview/components/badge-style-sizes.tsx",
      preview: lazy(() => import("@/preview/components/badge-style-sizes")),
    },
    "button-style-default": {
      name: "button-style-default",
      filePath: "preview/components/button-style-default.tsx",
      preview: lazy(() => import("@/preview/components/button-style-default")),
    },
    "button-style-secondary": {
      name: "button-style-secondary",
      filePath: "preview/components/button-style-secondary.tsx",
      preview: lazy(
        () => import("@/preview/components/button-style-secondary"),
      ),
    },
    "button-style-icon": {
      name: "button-style-icon",
      filePath: "preview/components/button-style-icon.tsx",
      preview: lazy(() => import("@/preview/components/button-style-icon")),
    },
    "button-style-outline": {
      name: "button-style-default",
      filePath: "preview/components/button-style-outline.tsx",
      preview: lazy(() => import("@/preview/components/button-style-outline")),
    },
    "button-style-link": {
      name: "button-style-link",
      filePath: "preview/components/button-style-link.tsx",
      preview: lazy(() => import("@/preview/components/button-style-link")),
    },
    "button-style-with-icon": {
      name: "button-style-with-icon",
      filePath: "preview/components/button-style-with-icon.tsx",
      preview: lazy(
        () => import("@/preview/components/button-style-with-icon"),
      ),
    },
    "card-style-default": {
      name: "card-style-default",
      filePath: "preview/components/card-style-default.tsx",
      preview: lazy(() => import("@/preview/components/card-style-default")),
    },
    "card-style-commerce": {
      name: "card-style-commerce",
      filePath: "preview/components/card-style-commerce.tsx",
      preview: lazy(() => import("@/preview/components/card-style-commerce")),
    },
    "card-style-testimonial": {
      name: "card-style-testimonial",
      filePath: "preview/components/card-style-testimonial.tsx",
      preview: lazy(
        () => import("@/preview/components/card-style-testimonial"),
      ),
    },
    "checkbox-style-default": {
      name: "checkbox-style-default",
      filePath: "preview/components/checkbox-style-default.tsx",
      preview: lazy(
        () => import("@/preview/components/checkbox-style-default"),
      ),
    },
    "checkbox-style-variants": {
      name: "checkbox-style-toggle",
      filePath: "preview/components/checkbox-style-variants.tsx",
      preview: lazy(
        () => import("@/preview/components/checkbox-style-variants"),
      ),
    },
    "checkbox-style-sizes": {
      name: "checkbox-style-default",
      filePath: "preview/components/checkbox-style-sizes.tsx",
      preview: lazy(() => import("@/preview/components/checkbox-style-sizes")),
    },
    // "dropdown-style-default": {
    //   name: "dropdown-style-default",
    //   filePath: "preview/components/dropdown-style-default.tsx",
    //   preview: lazy(() => import("@/preview/components/dropdown-style-default")),
    // },
    "input-style-default": {
      name: "input-style-default",
      filePath: "preview/components/input-style-default.tsx",
      preview: lazy(() => import("@/preview/components/input-style-default")),
    },
    "input-style-with-label": {
      name: "input-style-with-label",
      filePath: "preview/components/input-style-with-label.tsx",
      preview: lazy(
        () => import("@/preview/components/input-style-with-label"),
      ),
    },
    "input-style-error": {
      name: "input-style-error",
      filePath: "preview/components/input-style-error.tsx",
      preview: lazy(() => import("@/preview/components/input-style-error")),
    },
    "label-style-default": {
      name: "label-style-default",
      filePath: "preview/components/label-style-default.tsx",
      preview: lazy(() => import("@/preview/components/label-style-default")),
    },
    "menu-style-default": {
      name: "menu-style-default",
      filePath: "preview/components/menu-style-default.tsx",
      preview: lazy(() => import("@/preview/components/menu-style-default")),
    },
    "progress-style-default": {
      name: "progress-style-default",
      filePath: "preview/components/progress-style-default.tsx",
      preview: lazy(
        () => import("@/preview/components/progress-style-default"),
      ),
    },
    "popover-style-default": {
      name: "popover-style-default",
      filePath: "preview/components/popover-style-default.tsx",
      preview: lazy(() => import("@/preview/components/popover-style-default")),
    },
    "popover-style-default-shadow": {
      name: "popover-style-default-shadow",
      filePath: "preview/components/popover-style-default-shadow.tsx",
      preview: lazy(
        () => import("@/preview/components/popover-style-default-shadow"),
      ),
    },
    "radio-style-default": {
      name: "radio-style-default",
      filePath: "preview/components/radio-style-default.tsx",
      preview: lazy(() => import("@/preview/components/radio-style-default")),
    },
    "radio-style-variants": {
      name: "radio-style-variants",
      filePath: "preview/components/radio-style-variants.tsx",
      preview: lazy(() => import("@/preview/components/radio-style-variants")),
    },
    "radio-style-sizes": {
      name: "radio-style-sizes",
      filePath: "preview/components/radio-style-sizes.tsx",
      preview: lazy(() => import("@/preview/components/radio-style-sizes")),
    },
    "select-style-default": {
      name: "select-style-default",
      filePath: "preview/components/select-style-default.tsx",
      preview: lazy(() => import("@/preview/components/select-style-default")),
    },
    "switch-style-default": {
      name: "switch-style-default",
      filePath: "preview/components/switch-style-default.tsx",
      preview: lazy(() => import("@/preview/components/switch-style-default")),
    },
    "switch-style-disabled": {
      name: "switch-style-disabled",
      filePath: "preview/components/switch-style-disabled.tsx",
      preview: lazy(() => import("@/preview/components/switch-style-disabled")),
    },
    "textarea-style-default": {
      name: "textarea-style-default",
      filePath: "preview/components/textarea-style-default.tsx",
      preview: lazy(
        () => import("@/preview/components/textarea-style-default"),
      ),
    },
    "text-headings": {
      name: "text-headings",
      filePath: "preview/components/text-headings.tsx",
      preview: lazy(() => import("@/preview/components/text-headings")),
    },
    "typography-p": {
      name: "typography-p",
      filePath: "preview/components/typography-p.tsx",
      preview: lazy(() => import("@/preview/components/typography-p")),
    },
    "tab-style-default": {
      name: "typography-p",
      filePath: "preview/components/tab-style-default.tsx",
      preview: lazy(() => import("@/preview/components/tab-style-default")),
    },
    "dialog-style-default": {
      name: "dialog-style-default",
      filePath: "preview/components/dialog-style-default.tsx",
      preview: lazy(() => import("@/preview/components/dialog-style-default")),
    },
    "dialog-style-with-footer": {
      name: "dialog-style-with-footer",
      filePath: "preview/components/dialog-style-with-footer.tsx",
      preview: lazy(
        () => import("@/preview/components/dialog-style-with-footer"),
      ),
    },
    "dialog-style-width-variant": {
      name: "dialog-style-width-variant",
      filePath: "preview/components/dialog-style-width-variant.tsx",
      preview: lazy(
        () => import("@/preview/components/dialog-style-width-variant"),
      ),
    },
    "dialog-style-with-form": {
      name: "dialog-style-with-form",
      filePath: "preview/components/dialog-style-with-form.tsx",
      preview: lazy(
        () => import("@/preview/components/dialog-style-with-form"),
      ),
    },
    "slider-style-default": {
      name: "slider-style-default",
      filePath: "preview/components/slider-style-default.tsx",
      preview: lazy(() => import("@/preview/components/slider-style-default")),
    },
    "toggle-style-default": {
      name: "toggle-style-default",
      filePath: "preview/components/toggle-style-default.tsx",
      preview: lazy(() => import("@/preview/components/toggle-style-default")),
    },
    "toggle-style-outlined": {
      name: "toggle-style-outlined",
      filePath: "preview/components/toggle-style-outlined.tsx",
      preview: lazy(() => import("@/preview/components/toggle-style-outlined")),
    },
    "toggle-style-solid": {
      name: "toggle-style-solid",
      filePath: "preview/components/toggle-style-solid.tsx",
      preview: lazy(() => import("@/preview/components/toggle-style-solid")),
    },
    "toggle-style-outline-muted": {
      name: "toggle-style-outline-muted",
      filePath: "preview/components/toggle-style-outline-muted.tsx",
      preview: lazy(
        () => import("@/preview/components/toggle-style-outline-muted"),
      ),
    },
    "sonner-style-default": {
      name: "sonner-style-default",
      filePath: "preview/components/sonner-style-default.tsx",
      preview: lazy(() => import("@/preview/components/sonner-style-default")),
    },
    "sonner-style-status": {
      name: "sonner-style-status",
      filePath: "preview/components/sonner-style-status.tsx",
      preview: lazy(() => import("@/preview/components/sonner-style-status")),
    },
    "sonner-style-colored-status": {
      name: "sonner-style-colored-status",
      filePath: "preview/components/sonner-style-colored-status.tsx",
      preview: lazy(
        () => import("@/preview/components/sonner-style-colored-status"),
      ),
    },
    label: {
      name: "label",
      filePath: "preview/components/label.tsx",
      preview: lazy(() => import("@/preview/components/label")),
    },
    "tooltip-style-default": {
      name: "tooltip-style-default",
      filePath: "preview/components/tooltip-style-default.tsx",
      preview: lazy(() => import("@/preview/components/tooltip-style-default")),
    },
    "tooltip-style-solid": {
      name: "tooltip-style-solid",
      filePath: "preview/components/tooltip-style-solid.tsx",
      preview: lazy(() => import("@/preview/components/tooltip-style-solid")),
    },
    "tooltip-style-primary": {
      name: "tooltip-style-primary",
      filePath: "preview/components/tooltip-style-primary.tsx",
      preview: lazy(() => import("@/preview/components/tooltip-style-primary")),
    },
    "toggle-group-style-default": {
      name: "toggle-group-style-default",
      filePath: "preview/components/toggle-group-style-default.tsx",
      preview: lazy(
        () => import("@/preview/components/toggle-group-style-default"),
      ),
    },
    "toggle-group-style-outlined": {
      name: "toggle-group-style-outlined",
      filePath: "preview/components/toggle-group-style-outlined.tsx",
      preview: lazy(
        () => import("@/preview/components/toggle-group-style-outlined"),
      ),
    },
    "toggle-group-style-outline-muted": {
      name: "toggle-group-style-outline-muted",
      filePath: "preview/components/toggle-group-style-outline-muted.tsx",
      preview: lazy(
        () => import("@/preview/components/toggle-group-style-outline-muted"),
      ),
    },
    "toggle-group-style-solid": {
      name: "toggle-group-style-solid",
      filePath: "preview/components/toggle-group-style-solid.tsx",
      preview: lazy(
        () => import("@/preview/components/toggle-group-style-solid"),
      ),
    },
    "breadcrumb-style-default": {
      name: "breadcrumb-style-default",
      filePath: "preview/components/breadcrumb-style-default.tsx",
      preview: lazy(
        () => import("@/preview/components/breadcrumb-style-default"),
      ),
    },
    "breadcrumb-custom-separator": {
      name: "breadcrumb-custom-separator",
      filePath: "preview/components/breadcrumb-custom-separator.tsx",
      preview: lazy(
        () => import("@/preview/components/breadcrumb-custom-separator"),
      ),
    },
    "breadcrumb-style-collapsed": {
      name: "breadcrumb-style-collapsed",
      filePath: "preview/components/breadcrumb-style-collapsed.tsx",
      preview: lazy(
        () => import("@/preview/components/breadcrumb-style-collapsed"),
      ),
    },
    "breadcrumb-link-component": {
      name: "breadcrumb-link-component",
      filePath: "preview/components/breadcrumb-link-component.tsx",
      preview: lazy(
        () => import("@/preview/components/breadcrumb-link-component"),
      ),
    },
  },
};
