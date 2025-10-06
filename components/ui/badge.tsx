import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn('inline-block px-2 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700', className)}
      {...props}
    />
  );
}