import { motion } from 'framer-motion'
import { WaitlistForm } from "@/components/forms/waitlist-form";

export default function CTASection() {
    return (
        <>
            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to Transform Your Career?
                        </h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Join thousands of professionals who have already found their dream opportunities.
                        </p>
                        <div className="max-w-md mx-auto">
                            <WaitlistForm
                                variant="inline"
                                className="bg-white/10 backdrop-blur-sm border-white/20 p-4 rounded-lg"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}