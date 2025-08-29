import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Software Engineer",
        content: "This platform completely transformed my job search. I found my dream job within 2 weeks!",
        avatar: "SJ"
    },
    {
        name: "Michael Chen",
        role: "Product Manager",
        content: "The quality of opportunities here is unmatched. Every application led to meaningful conversations.",
        avatar: "MC"
    },
    {
        name: "Emily Rodriguez",
        role: "Designer",
        content: "Finally, a platform that understands what I'm looking for. The personalization is incredible.",
        avatar: "ER"
    }
];

export default function TestimonialsSection() {
    return (
        <>
            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Loved by Professionals
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            See what our users have to say about their experience.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl"
                            >
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {testimonial.avatar}
                                    </div>
                                    <div className="ml-3">
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {testimonial.name}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {testimonial.role}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}