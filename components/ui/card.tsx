import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700', className)}
      {...props}
    />
  );
}