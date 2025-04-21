import Header from "@/components/header";
import Faq from "@/components/home/faq";
import Hero from "@/components/home/hero/hero";
import Posts from "@/components/home/posts";
import Services from "@/components/home/services";
import ResetPasswordHandler from "@/components/reset-password-handler";
import Section from "@/components/section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header className="mb-0" />
      <Hero />
      <Section>
        <Services />
      </Section>
      <Section>
        <Posts />
      </Section>
      <Section className="pb-32">
        <Faq />
      </Section>
      <ResetPasswordHandler />
    </div>
  );
}