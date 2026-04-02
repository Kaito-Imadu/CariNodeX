import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`glass rounded-xl p-5 ${
        hover ? "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
