import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";

interface StatusBoxProps {
  status: string;
}

export default function StatusBox({ status }: StatusBoxProps) {
  return (
    <div
      className={cn(
        "w-6 h-6 rounded flex items-center justify-center text-white transition-all duration-500",
        status === "pending" && "bg-error-500",
        status === "sent" && "bg-success-500 animate-status-change",
        status === "failed" && "bg-error-500"
      )}
    >
      {status === "sent" ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <XIcon className="h-4 w-4" />
      )}
    </div>
  );
}

// Add custom keyframes for status change animation
const statusChangeKeyframes = `
@keyframes status-change {
  0% { transform: scale(1); background-color: rgb(239, 68, 68); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); background-color: rgb(16, 185, 129); }
}

.animate-status-change {
  animation: status-change 0.6s ease-in-out forwards;
}
`;

// Add the keyframes to the document
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = statusChangeKeyframes;
  document.head.appendChild(style);
}
