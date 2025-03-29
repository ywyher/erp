import Header from "@/components/header";
import About from "@/components/home/about";
import Hero from "@/components/home/hero/hero";
import Posts from "@/components/home/posts";

export default function Home() {
  return (
    <div>
      <Header />
      <Hero />
      <Posts />
    </div>
  );
}
