import React, { useState, useEffect } from 'react';
import { LucideProps } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
  type IconComponent = React.ComponentType<LucideProps>;
  
  const [Icon, setIcon] = useState<IconComponent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    import('lucide-react')
      .then((module) => {
        if (module[name]) {
          setIcon(() => module[name] as IconComponent);
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

  if (loading) return <Skeleton className='h-12 w-12 rounded-full' />;
  if (error) return <span>{error}</span>;
  if (Icon) return <Icon {...props} />;
  
  return null;
}