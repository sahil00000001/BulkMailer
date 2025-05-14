import { useState, useRef, useCallback } from "react";
import { useEmail } from "@/hooks/use-email";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, UploadIcon, DownloadIcon, InfoIcon } from "lucide-react";
import StatusBox from "@/components/StatusBox";
import { useToast } from "@/hooks/use-toast";

export default function ExcelUpload() {
  const { recipients, setCurrentStep, isUploading, uploadExcel, downloadSample } = useEmail();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file extension
    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid file",
        description: "Only .xlsx files are supported",
        variant: "destructive"
      });
      return;
    }
    
    setFileName(file.name);
    await uploadExcel(file);
  }, [uploadExcel, toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check file extension
    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid file",
        description: "Only .xlsx files are supported",
        variant: "destructive"
      });
      return;
    }
    
    setFileName(file.name);
    uploadExcel(file);
  }, [uploadExcel, toast]);

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleBackClick = useCallback(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleContinueClick = useCallback(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Upload Recipients Data</h2>
        <p className="text-sm text-gray-600 mt-1">Upload an Excel file containing recipient information</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Upload Excel File</h3>
              
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center">
                    <UploadIcon className="text-gray-400 h-10 w-10 mb-2" />
                    <p className="text-sm text-gray-500">
                      {fileName ? fileName : "Drag and drop your Excel file here, or"}
                    </p>
                    <Button 
                      type="button" 
                      className="mt-2" 
                      onClick={handleBrowseClick}
                      disabled={isUploading}
                    >
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept=".xlsx" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <InfoIcon className="text-gray-400 h-4 w-4" />
                    <p className="text-xs text-gray-500">Only .xlsx format is supported</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary-600 hover:text-primary-700 flex items-center p-0"
                    onClick={downloadSample}
                  >
                    <DownloadIcon className="mr-1 h-3 w-3" />
                    Download Sample
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 h-full">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Expected Format</h3>
              
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&h=400" 
                alt="Professional email communication" 
                className="rounded-lg mb-4 w-full object-cover h-40" 
              />
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-xs text-gray-600">Sahil</td>
                      <td className="px-4 py-2 text-xs text-gray-600">sahil@gmail.com</td>
                      <td className="px-4 py-2 text-xs text-gray-600">Software Developer</td>
                      <td className="px-4 py-2 text-xs text-gray-600">Fortek</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {recipients.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Recipients Preview</h3>
            
            <div className="overflow-x-auto shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipients.map((recipient, index) => (
                    <tr key={`${recipient.email}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{recipient.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{recipient.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{recipient.designation}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{recipient.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBox status={recipient.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleBackClick}
            disabled={isUploading}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinueClick}
            disabled={recipients.length === 0 || isUploading}
          >
            <ArrowRightIcon className="mr-2 h-4 w-4" />
            Continue to Send
          </Button>
        </div>
      </div>
    </>
  );
}
