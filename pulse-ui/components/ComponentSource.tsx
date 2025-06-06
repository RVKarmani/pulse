import { cn } from "@/lib/utils";

interface ComponentSourceProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
}

export function ComponentSource({ children, className }: ComponentSourceProps) {
  return (
    <div className={cn("overflow-hidden rounded-md", className)}>
      {children}
    </div>
  );
}
