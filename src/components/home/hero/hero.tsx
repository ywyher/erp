import CardLayout from "@/components/card-layout";
import Left from '@/components/home/hero/left';
import Right from '@/components/home/hero/right';
import Book from '@/components/home/hero/book';

export default function Hero() {
    return (
        <CardLayout 
            variant="home"
            contentClassName="
                grid grid-cols-1 lg:grid-cols-2
                items-center min-h-[85vh]
                pt-5 lg:pt-0
                lg:gap-0 gap-24
            "
        >
            <div className="flex flex-col justify-center h-full gap-5">
                <Left />
                <Book />
            </div>
            <div className="flex justify-center lg:justify-end">
                <Right />
            </div>
        </CardLayout>
    )
}