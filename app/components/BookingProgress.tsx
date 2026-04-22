interface BookingProgressProps {
  currentStep: number;
  steps?: string[];
}

const DEFAULT_STEPS = ["Dates", "Your Info", "Review", "Confirmation"];

export default function BookingProgress({
  currentStep,
  steps = DEFAULT_STEPS,
}: BookingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connector line */}
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-800 z-0">
          <div
            className="h-full bg-[#2952CC] transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={step} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isDone
                    ? "bg-[#2952CC] border-[#2952CC] text-white"
                    : isCurrent
                    ? "bg-[#2952CC]/20 border-[#2952CC] text-[#2952CC]"
                    : "bg-gray-900 border-gray-700 text-gray-500"
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isCurrent ? "text-white" : isDone ? "text-[#2952CC]" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
