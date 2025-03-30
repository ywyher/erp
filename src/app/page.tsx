import Header from "@/components/header";
import Hero from "@/components/home/hero/hero";
import Posts from "@/components/home/posts";
import Services from "@/components/home/services";

export const gradient = (pos: 'middle' | 'top-left' | 'bottom-right') => {
  switch (pos) {
    case 'middle':
      return (
        <div className="absolute top-0 -z-10 h-full w-full bg-transparent">
          <div className="
            absolute left-1/2 top-1/2 
            -translate-x-1/2 -translate-y-1/2 
            h-[600px] w-[70%] 
            rounded-full bg-primary opacity-50 blur-[80px]
          "></div>
        </div>
      )
    break;
    case "top-left": 
      return (
        <div className="absolute top-0 -z-10 h-full w-full bg-transparent">
          <div className="
            absolute top-[25%] left-0 
            -translate-x-1/3 -translate-y-1/3
            h-[300px] w-[300px] 
            rounded-full bg-primary opacity-50 blur-[80px]">
          </div>
        </div>
      )
    break;
    case "bottom-right": 
      return (
        <div className="absolute top-0 -z-10 h-full w-full bg-transparent">
          <div className="
            absolute bottom-0 right-0
            -translate-x-1 -translate-y-1/3 
            h-[300px] w-[200px] 
            rounded-full bg-secondary opacity-50 blur-[80px]
          "></div>
        </div>
      )
    break;
    default:
      return <></>
    break;
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Posts />
        <Services />
      </main>
    </div>
  );
}
