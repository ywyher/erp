import CardLayout from "@/components/card-layout";
import { getFaq } from "@/components/home/actions";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default async function Faq() {
  const faq = await getFaq()

  if (faq && faq.length === 0) return null;
  
  return (
    <CardLayout 
        title="F.A.Q"
        variant="home"
        className="w-full h-fit flex flex-col justify-center"
    >
      <Accordion type="single" collapsible className="w-full">
        {faq.map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger className="text-xl">{item.question}</AccordionTrigger>
            <AccordionContent className="text-lg">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
        {faq.map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx + Math.random()}`}>
            <AccordionTrigger className="text-xl">{item.question}</AccordionTrigger>
            <AccordionContent className="text-lg">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
        {faq.map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx + Math.random()}`}>
            <AccordionTrigger className="text-xl">{item.question}</AccordionTrigger>
            <AccordionContent className="text-lg">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
        {faq.map((item, idx) => (
          <AccordionItem key={idx} value={`item-${idx + Math.random()}`}>
            <AccordionTrigger className="text-xl">{item.question}</AccordionTrigger>
            <AccordionContent className="text-lg">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </CardLayout>
  )
}