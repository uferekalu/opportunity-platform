import { motion } from 'framer-motion'
import { NewsletterForm } from '@/components/forms/newsletter-form'

export default function NewsletterSection() {
    return (
        <>
            {/* Newsletter Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Stay Updated with Industry Insights
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Get weekly newsletters with the latest opportunities, career tips, and industry trends.
                        </p>
                        <div className="max-w-md mx-auto">
                            <NewsletterForm
                                variant="default"
                                showProviderSelection={true}
                                title="Subscribe to Our Newsletter"
                                description="Choose your preferred newsletter platform and stay informed."
                            />
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}