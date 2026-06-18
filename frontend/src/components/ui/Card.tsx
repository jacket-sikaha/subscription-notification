import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
}

export function Card({ padding = "md", className = "", children, ...props }: CardProps) {
  const paddings: Record<string, string> = {
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
