import Header from "@/components/header";
import Hero from "@/components/home/hero/hero";
import Posts from "@/components/home/posts";
import Services from "@/components/home/services";

export const gradient = (pos: 'middle' | 'top-left' | 'bottom-right') => {
  switch (pos) {
    case 'middle':
      return (
        <div className="absolute inset-0 -z-10 overflow-hidden xl:overflow-visible pointer-events-none">
          <div className="
            absolute left-1/2 top-1/2 
            -translate-x-1/2 -translate-y-1/2 
            md:h-[400px] md:w-[60%] w-[100%] h-[700px] 
            rounded-full bg-primary opacity-30 blur-[80px]
          "></div>
        </div>
      )
    
    case "top-left": 
      return (
        <div className="absolute inset-0 -z-10 overflow-hidden xl:overflow-visible pointer-events-none">
          <div className="
            absolute top-[25%] left-0 
            -translate-x-1/3 -translate-y-1/3
            h-[300px] w-[300px] 
            rounded-full bg-primary opacity-50 blur-[80px]">
          </div>
        </div>
      )
    
    case "bottom-right": 
      return (
        <div className="absolute inset-0 -z-10 overflow-hidden xl:overflow-visible pointer-events-none">
          <div className="
            absolute bottom-0 right-0
            translate-x-1/4 translate-y-1/4
            h-[300px] w-[200px] 
            rounded-full bg-secondary opacity-50 blur-[80px]
          "></div>
        </div>
      )
    
    default:
      return <></>
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Services />
        <Posts />
      </main>
    </div>
  );
}
