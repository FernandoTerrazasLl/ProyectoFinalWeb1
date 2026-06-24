import { iconPaths } from "@shared/ui/Icon/iconPaths";

type ReactIconProps = {
  className?: string;
  name: keyof typeof iconPaths;
};

export function ReactIcon({ className, name }: ReactIconProps) {
  const path = iconPaths[name] ?? "";

  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: path }}
    />
  );
}
