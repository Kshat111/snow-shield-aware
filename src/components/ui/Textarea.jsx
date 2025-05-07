import React from 'react';

export const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea'; 