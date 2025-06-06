# Contributing to RetroUI

Thank you for your interest in contributing to RetroUI 🙏. I hope this guide to help you get started.

## Getting Started

1. Fork this repository

2. Clone the forked repository to your local machine.

   ```bash
   git clone https://github.com/<YOUR_USERNAME>/retroui.git
   ```

3. Navigate to the project directory

   ```bash
   cd retroui
   ```

4. Create a new branch

   ```bash
   git switch -c new-branch-name
   ```

5. install dependencies

   ```bash
   pnpm i
   ```

6. Run the project
   ```bash
   pnpm dev
   ```

## Adding a New Component

1. Create the main component in `/components/retroui/NewComponent/NewComponent.tsx`

```ts
export function NewComponent() {
  return <div>This is your component.</div>;
}
```

2. Export your component in `/components/retroui/NewComponent/index.ts` and `/components/retroui/index.ts`

```ts
export * from "./NewComponent";
```

3. Create a preview to showcase your component in `preview/components/new-component.tsx`

```typescript
export default function NewComponentStyle() {
  return (
    <span className="px-2.5 py-1 text-sm font-semibold border-2 border-red-600 text-red-600">
      Error
    </span>
  );
}
```

4. Add your component preview to the list of components registry in `config/components.ts`

```typescript
export const componentConfig = {
  registry: {
    ...
    "new-component": {
      name: "new-component",
      filePath: "preview/components/new-component.tsx",
      preview: lazy(() => import("@/preview/components/new-component")),
    },
  },
};
```

5. Add documentation for your component in `content/docs/components/...mdx`

```md
---
title: Badge
description: The component that looks like a button but isn't clickable!
lastUpdated: 08 Oct, 2024
---

...

### New Component

<ComponentShowcase name="new-component" /> // name of the component in the registry
```

## Ask for Help

For any help or questions, please open a new GitHub issue.
