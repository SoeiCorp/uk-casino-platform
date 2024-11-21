import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-muted">{title}</h3>
        <div className="text-primary">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-secondary">{value}</p>
    </motion.div>
  );
};

export default StatCard;