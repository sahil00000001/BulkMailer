import { useEmail } from "@/hooks/use-email";
import CredentialsForm from "@/components/CredentialsForm";
import ExcelUpload from "@/components/ExcelUpload";
import EmailSending from "@/components/EmailSending";
import StepIndicator from "@/components/StepIndicator";
import { MailIcon, Send } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { currentStep, setCurrentStep, credentials } = useEmail();

  // Handle logo click
  const handleLogoClick = (e: React.MouseEvent) => {
    if (credentials) {
      e.preventDefault();
      setCurrentStep(2); // Go to Excel upload if credentials exist
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with better gradient and no "powered by" text */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" onClick={handleLogoClick}>
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:shadow-md transition-all duration-200">
                <Send className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Gmail Bulk Mailer
              </h1>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps with updated styles */}
          <StepIndicator currentStep={currentStep} />
          
          {/* Multi-view Container with subtle animation */}
          <div 
            className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 transition-all duration-300" 
            id="main-content"
            style={{
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 8px rgba(0, 0, 0, 0.03)"
            }}
          >
            {currentStep === 1 && <CredentialsForm />}
            {currentStep === 2 && <ExcelUpload />}
            {currentStep === 3 && <EmailSending />}
          </div>
        </div>
      </main>

      {/* Enhanced footer with gradient */}
      <footer className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
            </div>
            <p className="text-sm font-medium text-gray-800">Gmail Bulk Mail Sender</p>
            <p className="text-xs text-gray-500 mt-1">Premium mass email solution</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
