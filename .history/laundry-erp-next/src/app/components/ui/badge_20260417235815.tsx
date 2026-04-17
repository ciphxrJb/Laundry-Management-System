import * as React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'outline' | 'secondary';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground border-transparent',
  outline: 'border-border bg-transparent text-foreground',
  secondary: 'bg-secondary text-secondary-foreground border-transparent',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
