import React, { useState, useEffect } from 'react';
import { LucideProps } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// This approach uses a type assertion to tell TypeScript 
// that the icon name will be valid
interface DynamicIconProps extends LucideProps {
  name: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const [Icon, setIcon] = useState<React.ComponentType<LucideProps> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    import('lucide-react')
      .then((module) => {
        // Use type assertion to tell TypeScript that name is a valid key
        const iconComponent = module[name as keyof typeof module];
        
        if (iconComponent) {
          setIcon(() => iconComponent as React.ComponentType<LucideProps>);
        } else {
          setError(`Icon "${name}" not found`);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [name]);

  if (loading) return <Skeleton className="h-12 w-12 rounded-full" />;
  if (error) return <span>{error}</span>;
  if (Icon) return <Icon {...props} />;
  
  return null;
}