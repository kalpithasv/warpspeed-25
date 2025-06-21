import { motion } from 'framer-motion';
import {
    MessageCircle,
    Bot,
    QrCode,
    BarChart3,
    ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const features = [
        {
            icon: <QrCode className="w-8 h-8" />,
            title: "Quick Setup",
            description: "Scan QR code to connect your WhatsApp Business instantly"
        },
        {
            icon: <Bot className="w-8 h-8" />,
            title: "AI Assistant",
            description: "Smart chatbot handles customer queries and product uploads"
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Analytics Dashboard",
            description: "Track sales, customer interactions, and business insights"
        }
    ];

    const steps = [
        {
            step: "01",
            title: "Contact Admin",
            description: "Reach out to our admin team to get started"
        },
        {
            step: "02",
            title: "Receive QR Code",
            description: "Get your unique QR code for WhatsApp integration"
        },
        {
            step: "03",
            title: "Connect & Upload",
            description: "Scan, connect, and start uploading your products"
        },
        {
            step: "04",
            title: "Start Selling",
            description: "Customers can now buy directly through WhatsApp"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
            {/* Header */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="px-6 py-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/50"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <MessageCircle className="w-8 h-8 text-green-600" />
                        <span className="text-2xl font-bold text-slate-800">WhatsApp Commerce</span>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-slate-600 hover:text-slate-800 transition-colors">Features</a>
                        <a href="#how-it-works" className="text-slate-600 hover:text-slate-800 transition-colors">How it Works</a>
                        <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            Get Started
                        </button>
                    </nav>
                </div>
            </motion.header>

            {/* Hero Section */}
            <section className="px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
                                Transform Your
                                <span className="text-green-600"> WhatsApp</span> Into A
                                <span className="text-green-600"> Smart Store</span>
                            </h1>
                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                Connect your WhatsApp Business with our AI-powered ecommerce agent.
                                Upload products, manage customers, and boost sales—all through WhatsApp.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/auth/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Become a Seller <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </Link>
                                <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-slate-400 transition-colors">
                                    Watch Demo
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800">AI Assistant</h3>
                                        <p className="text-slate-500 text-sm">Online now</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-slate-700">Welcome! I can help you upload products and manage your store. What would you like to do today?</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <p className="text-slate-700">I want to add a new product</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="text-slate-700">Great! Please share the product image and details...</p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-100 rounded-full opacity-20"></div>
                            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-100 rounded-full opacity-20"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-6 py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-800 mb-4">
                            Everything You Need to Sell on WhatsApp
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Our platform provides all the tools you need to turn your WhatsApp into a powerful ecommerce engine
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-800 mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Get started in minutes with our simple 4-step process
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{step.title}</h3>
                                    <p className="text-slate-600">{step.description}</p>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-slate-200 -translate-x-8">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-slate-300 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-20 bg-gradient-to-r from-green-600 to-green-700">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of sellers who are already using WhatsApp to grow their business with our AI-powered platform.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors inline-flex items-center gap-2"
                        >
                            Become a Seller Today <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 bg-slate-800 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <MessageCircle className="w-6 h-6 text-green-400" />
                                <span className="text-xl font-bold">WhatsApp Commerce</span>
                            </div>
                            <p className="text-slate-400">
                                Transforming WhatsApp into powerful ecommerce stores with AI.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-slate-400">
                                <li>Features</li>
                                <li>Pricing</li>
                                <li>API</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-slate-400">
                                <li>About</li>
                                <li>Blog</li>
                                <li>Careers</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-slate-400">
                                <li>Help Center</li>
                                <li>Contact</li>
                                <li>Status</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
                        <p>&copy; 2025 WhatsApp Commerce. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;