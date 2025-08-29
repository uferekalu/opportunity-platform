import { motion } from 'framer-motion'
import { ChevronRight, Star, Users } from 'lucide-react'
import { Button } from '../button'
import { WaitlistForm } from '../../forms/waitlist-form'

export default function HeroSection() {
    return (
        <>
            <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-40">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                    <g fill="none" fillRule="evenodd">
                                        <g fill="#9C92AC" fillOpacity="0.05">
                                            <path d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
                                        </g>
                                    </g>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-left"
                        >
                            <div className="inline-flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-6 dark:bg-blue-900 dark:text-blue-200">
                                <Star className="w-4 h-4 mr-2" />
                                Early Access Available
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                Your Gateway to
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Exclusive
                                </span>
                                <br />Opportunities
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Discover hand-curated job opportunities, internships, and freelance projects from top companies. Join thousands of professionals who found their dream careers.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Button size="xl" variant="primary" className="group">
                                    Get Early Access
                                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                <Button size="xl" variant="outline">
                                    Watch Demo
                                </Button>
                            </div>

                            <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    10K+ Users
                                </div>
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                    4.9/5 Rating
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:pl-8"
                        >
                            <WaitlistForm
                                variant="default"
                                showReferralSource={true}
                                className="max-w-md mx-auto shadow-xl"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    )
}