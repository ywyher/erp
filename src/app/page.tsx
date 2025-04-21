import Header from "@/components/header";
import Faq from "@/components/home/faq";
import Hero from "@/components/home/hero/hero";
import Posts from "@/components/home/posts";
import Services from "@/components/home/services";
import ResetPasswordHandler from "@/components/reset-password-handler";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header className="mb-0" />
      <Hero />
      <Services />
      <Posts />
      <Faq />
      <ResetPasswordHandler />
    </div>
  );
}