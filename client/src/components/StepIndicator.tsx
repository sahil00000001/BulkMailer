import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  {
    number: 1,
    title: "Credentials",
    description: "Gmail login setup",
  },
  {
    number: 2,
    title: "Excel Upload",
    description: "Upload recipient data",
  },
  {
    number: 3,
    title: "Send & Report",
    description: "View results",
  },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="flex items-center relative">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {index > 0 && (
              <div className={cn(
                "mx-12 h-1 w-16 sm:w-20 md:w-24 lg:w-32 rounded-full transition-all duration-300",
                index < currentStep ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-gray-200"
              )} />
            )}
            <div className="flex items-center">
              <div 
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full font-semibold relative transition-all duration-300",
                  step.number === currentStep
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-blue-100"
                    : step.number < currentStep
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                )}
              >
                {step.number}
                {step.number < currentStep && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className={cn(
                  "font-medium transition-colors duration-300",
                  step.number === currentStep 
                    ? "text-gray-900 text-sm" 
                    : step.number < currentStep
                      ? "text-blue-600 text-sm"
                      : "text-gray-500 text-sm"
                )}>
                  {step.title}
                </p>
                <p className={cn(
                  "text-xs", 
                  step.number === currentStep ? "text-gray-600" : "text-gray-400"
                )}>
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
