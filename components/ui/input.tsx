import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn('border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600', className)}
      {...props}
    />
  );
}