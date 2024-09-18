import React from 'react';
import { motion } from 'framer-motion';
import { FormattedMessage } from 'react-intl';

const steps = [
  {
    titleId: "howItWorks.step1.title",
    descriptionId: "howItWorks.step1.description",
    icon: "🔐"
  },
  {
    titleId: "howItWorks.step2.title",
    descriptionId: "howItWorks.step2.description",
    icon: "🔗"
  },
  {
    titleId: "howItWorks.step3.title",
    descriptionId: "howItWorks.step3.description",
    icon: "📤"
  },
  {
    titleId: "howItWorks.step4.title",
    descriptionId: "howItWorks.step4.description",
    icon: "📊"
  }
];

function HowItWorks() {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-indigo-600 mb-2">
              <FormattedMessage id="howItWorks.title" />
            </h2>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.titleId}
                className="bg-indigo-50 rounded-lg p-6 shadow-md flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-500 rounded-full p-3 mr-4">
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    <FormattedMessage id={step.titleId} />
                  </h3>
                </div>
                <p className="text-gray-600">
                  <FormattedMessage id={step.descriptionId} />
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

export default HowItWorks;