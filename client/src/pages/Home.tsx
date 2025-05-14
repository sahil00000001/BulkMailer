import { useEffect } from "react";
import { useEmail } from "@/hooks/use-email";
import CredentialsForm from "@/components/CredentialsForm";
import ExcelUpload from "@/components/ExcelUpload";
import EmailSending from "@/components/EmailSending";
import StepIndicator from "@/components/StepIndicator";
import { MailIcon } from "lucide-react";

export default function Home() {
  const { currentStep } = useEmail();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MailIcon className="text-primary-600 h-6 w-6" />
            <h1 className="text-xl font-semibold text-gray-800">Gmail Bulk Mail Sender</h1>
          </div>
          <div>
            <span className="hidden sm:inline text-gray-500">Powered by NodeMailer</span>
          </div>
        </div>
      </header>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          <StepIndicator currentStep={currentStep} />
          
          {/* Multi-view Container */}
          <div className="bg-white shadow rounded-lg overflow-hidden" id="main-content">
            {currentStep === 1 && <CredentialsForm />}
            {currentStep === 2 && <ExcelUpload />}
            {currentStep === 3 && <EmailSending />}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500">Gmail Bulk Mail Sender using NodeMailer & Excel Upload</p>
            <p className="text-xs text-gray-400 mt-1">Developed with ❤️ by Sahil Vashisht</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
