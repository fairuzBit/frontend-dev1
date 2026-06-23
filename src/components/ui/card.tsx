import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx('rounded-[24px] border border-slate-200 bg-white bg-opacity-80 backdrop-blur-md p-5 shadow-sm dark:bg-bgSecondary dark:border-borderColor', className))} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx('mb-4 flex items-start justify-between', className))} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={twMerge(clsx('text-lg font-semibold text-slate-900 dark:text-white', className))} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx('space-y-3', className))} {...props} />;
}
