import Header from "@/components/header";
import Faq from "@/components/home/faq";
import Hero from "@/components/home/hero/hero";
import Posts from "@/components/home/posts";
import Services from "@/components/home/services";
import ResetPasswordHandler from "@/components/reset-password-handler";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header className="mb-0" />
      <div className="flex flex-col gap-20">
        <Hero />
        <main className="flex-1 flex flex-col gap-32">
          <Services />
          <Posts />
          <Faq />
        </main>
      </div>
      <ResetPasswordHandler />
    </div>
  );
}