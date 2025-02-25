'use client'

import CardLayout from "@/app/(authenticated)/dashboard/_components/card-layout";
import { motion } from "framer-motion";

export default function Dashboard() {
    return (
        <CardLayout className="flex items-center justify-center min-h-screen">
            <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                animate={{ opacity: [0, 1, 0] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <h1 className="text-6xl font-bold text-zinc-900 dark:text-zinc-100">
                    Coming Soon
                </h1>
            </motion.div>
        </CardLayout>
    );
}