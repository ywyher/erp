export const gradient = (pos: 'middle' | 'top-left' | 'bottom-right') => {
  // Common CSS classes for all gradient positions
  const baseClasses = "absolute -z-10 pointer-events-none overflow-hidden";
  const glowClasses = "absolute rounded-full bg-opacity-30 transform-gpu";
  
  switch (pos) {
    case 'middle':
      return (
        <div className={`${baseClasses} inset-0`}>
          <div 
            className={`
              ${glowClasses}
              left-1/2 top-1/2
              -translate-x-1/2 -translate-y-1/2
              md:h-[400px] md:w-[60%] w-full h-[700px]
              bg-primary opacity-30
            `}
            style={{
              filter: 'blur(80px)',
              willChange: 'transform, filter',
            }}
          />
        </div>
      );
    
    case "top-left":
      return (
        <div className={`${baseClasses} inset-0`}>
          <div 
            className={`
              ${glowClasses}
              top-[25%] left-0
              -translate-x-1/3 -translate-y-1/3
              h-[300px] w-[300px]
              bg-primary opacity-50
            `}
            style={{
              filter: 'blur(60px)',
              willChange: 'transform, filter',
            }}
          />
        </div>
      );
    
    case "bottom-right":
      return (
        <div className={`${baseClasses} inset-0`}>
          <div 
            className={`
              ${glowClasses}
              bottom-0 right-0
              translate-x-1/4 translate-y-1/4
              h-[300px] w-[200px]
              bg-secondary opacity-50
            `}
            style={{
              filter: 'blur(60px)',
              willChange: 'transform, filter',
            }}
          />
        </div>
      );
    
    default:
      return null;
  }
};