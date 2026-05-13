"use client";

import { Check, Clock, Send, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

interface BookingTimelineProps {
  status: string;
}

export default function BookingTimeline({ status }: BookingTimelineProps) {
  const steps = [
    {
      id: "sent",
      label: "Application Sent",
      description: "Your request has been submitted successfully.",
      icon: Send,
      isCompleted: true,
    },
    {
      id: "received",
      label: "Received",
      description: "Our system has acknowledged your application.",
      icon: Check,
      isCompleted: true,
    },
    {
      id: "pending",
      label: "Waiting for Confirmation",
      description: "The advocate is reviewing your request.",
      icon: Hourglass,
      isCompleted: status === "confirmed" || status === "pending" || status === "completed",
      isActive: status === "pending",
    },
    {
      id: "confirmed",
      label: "You're All Set",
      description: "Your appointment is confirmed!",
      icon: Clock,
      isCompleted: status === "confirmed" || status === "completed",
      isActive: status === "confirmed",
    },
  ];

  return (
    <div className="py-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gray-100" />
        <div 
          className="absolute left-[22px] top-0 w-0.5 bg-[#C9A227] transition-all duration-1000" 
          style={{ 
            height: status === "confirmed" || status === "completed" ? "100%" : 
                    status === "pending" ? "66%" : "33%" 
          }} 
        />

        <div className="space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = step.isCompleted;
            const isActive = step.isActive;

            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative flex gap-6 items-start"
              >
                <div className={`relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                  isCompleted ? "bg-[#C9A227] text-white" : "bg-white border-2 border-gray-100 text-gray-300"
                } ${isActive ? "ring-4 ring-[#C9A227]/10 scale-110" : ""}`}>
                  {isActive && !isCompleted ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>

                <div className="flex-grow pt-1">
                  <h4 className={`text-sm font-bold uppercase tracking-widest ${
                    isCompleted ? "text-[#0A2342]" : "text-gray-400"
                  }`}>
                    {step.label}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
