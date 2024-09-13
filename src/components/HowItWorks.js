import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    title: "Sign Up",
    description: "Once you sign up, you'll gain access to a dashboard where your MBTI results are updated in real time.",
    icon: "🔐"
  },
  {
    title: "Generate Link",
    description: "Create a unique test link for your friends or family members to fill out for you.",
    icon: "🔗"
  },
  {
    title: "Share",
    description: "Send the link to someone who knows you well to take the test for you.",
    icon: "📤"
  },
  {
    title: "Analyze",
    description: "See your MBTI results get updated in real-time.",
    icon: "📊"
  }
];

function HowItWorks() {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-600 mb-2">How It Works</h2>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                className="bg-indigo-50 rounded-lg p-6 shadow-md flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-500 rounded-full p-3 mr-4">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                </div>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

export default HowItWorks;