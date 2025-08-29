import { motion } from 'framer-motion'
import { PricingPlans } from '@/components/forms/pricing-plans'

export default function PricingPlanSection() {
    return (
        <>
            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <PricingPlans />
                    </motion.div>
                </div>
            </section>
        </>
    )
}