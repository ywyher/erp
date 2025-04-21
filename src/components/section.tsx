import React from "react"

type SectionProps = {
    children: React.ReactNode;
    className?: string
}

export default function Section({ children, className = "", ...props }: SectionProps) {
    return (
      <section 
        className={`py-16 md:py-24 w-full ${className}`}
        {...props}
      >
        {children}
      </section>
    )
}