import { motion } from 'framer-motion'
import { Briefcase, ChevronRight } from 'lucide-react'
import { Button } from '../button'
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';

export default function DashboardPreviewSection() {
    const { state } = useApp();
    const router = useRouter();

    const handleDashboardExplore = () => {
        if (!state.isAuthenticated) {
            router.push('/auth');
        } else {
            router.push('/dashboard');
        }
    }

    return (
        <>
            {/* Dashboard Preview Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Powerful Dashboard at Your Fingertips
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Manage your opportunities, track applications, and discover new possibilities all in one place.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg mb-4">
                                    <Briefcase className="w-5 h-5 mr-2" />
                                    Live Dashboard Preview
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Real opportunities, real-time updates, real results.
                                </p>
                            </div>

                            <div className="text-center">
                                <Button size="xl" variant="primary" className="group" onClick={handleDashboardExplore}>
                                    Explore Dashboard
                                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                                {/* <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                    No signup required • Interactive demo available
                                </p> */}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    )
}