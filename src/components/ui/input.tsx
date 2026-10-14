import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const field = "w-full rounded-xl border border-line bg-black/30 px-3 py-3 text-sm text-ink outline-none placeholder:text-muted/70";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <InputBase className={className} {...props} />;
}

function InputBase({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, "min-h-32 resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(field, className)} {...props}>
      {children}
    </select>
  );
}
