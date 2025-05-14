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
                "mx-12 h-0.5 w-16 sm:w-20 md:w-24 lg:w-32",
                index < currentStep ? "bg-primary-600" : "bg-gray-200"
              )} />
            )}
            <div className="flex items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full font-semibold relative",
                step.number <= currentStep
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-500"
              )}>
                {step.number}
              </div>
              <div className="ml-3">
                <p className={cn(
                  "text-sm font-medium",
                  step.number <= currentStep ? "text-primary-600" : "text-gray-500"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
