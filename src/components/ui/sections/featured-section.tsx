import { motion } from 'framer-motion'
import { Globe, Shield, TrendingUp, Zap } from 'lucide-react';

const features = [
    {
        icon: <Zap className="w-6 h-6" />,
        title: "Lightning Fast",
        description: "Get opportunities delivered instantly to your dashboard with real-time updates."
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Verified Opportunities",
        description: "All opportunities are verified and curated by our expert team for quality assurance."
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: "Global Reach",
        description: "Access opportunities from companies worldwide, remote or on-site positions."
    },
    {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Career Growth",
        description: "Track your application progress and get insights to boost your career."
    }
];

export default function FeaturedSection() {
    return (
        <>
            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Why Choose OpportunityHub?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            We've built the most advanced platform for discovering and applying to exclusive opportunities.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}