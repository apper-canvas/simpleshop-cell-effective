import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ title, value, icon, trend, color = "primary", className = "" }) => {
  const colorStyles = {
    primary: {
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      trendColor: "text-primary-600"
    },
    success: {
      iconBg: "bg-success-100",
      iconColor: "text-success-600",
      trendColor: "text-success-600"
    },
    warning: {
      iconBg: "bg-warning-100",
      iconColor: "text-warning-600",
      trendColor: "text-warning-600"
    },
    error: {
      iconBg: "bg-error-100",
      iconColor: "text-error-600",
      trendColor: "text-error-600"
    }
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-6 ${className}`} hover>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-full ${styles.iconBg}`}>
              <ApperIcon name={icon} className={`h-6 w-6 ${styles.iconColor}`} />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-secondary-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 gradient-text">{value}</p>
            {trend && (
              <p className={`text-sm ${styles.trendColor} mt-1`}>{trend}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MetricCard;