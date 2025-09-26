import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item.",
  icon = "Package",
  actionLabel,
  onAction
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center py-12"
    >
      <Card className="p-8 text-center max-w-md">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-gray-100">
            <ApperIcon name={icon} className="h-10 w-10 text-secondary-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-secondary-600 mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary">
            <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

export default Empty;