import { motion, AnimatePresence } from 'framer-motion';
import Spinner from './spinner';
import logo from "@/assets/logo.png";
import { useDarkModeStore } from '@/hooks/controller';

export default function SplashLoader() {
    const { isDarkMode } = useDarkModeStore();
    return (
        <AnimatePresence>
            <motion.div
                key="splash"
                className={`fixed gap-8 inset-0 flex flex-col items-center justify-center z-50 ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: .4 } }}
                exit={{ opacity: 0, transition: { duration: .3 } }}
            >
                {/* LOGO wrapper */}
                <motion.div
                    className="w-48"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
                >
                    <img src={logo} alt="Nex Logo" className={`select-none`} />
                </motion.div>

                {/* RING SPINNER */}
                <motion.div
                    className="w-14 h-14 relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: .6 } }}
                >
                    <Spinner />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};