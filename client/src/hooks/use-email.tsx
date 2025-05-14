import { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Recipient, Credentials } from "@/lib/types";

type EmailContextType = {
  credentials: Credentials | null;
  setCredentials: (credentials: Credentials) => void;
  recipients: Recipient[];
  setRecipients: (recipients: Recipient[]) => void;
  batchId: string | null;
  setBatchId: (batchId: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isUploading: boolean;
  uploadExcel: (file: File) => Promise<void>;
  isSending: boolean;
  sendingProgress: {
    sent: number;
    failed: number;
    total: number;
    completed: boolean;
  };
  sendEmails: () => Promise<void>;
  downloadSample: () => void;
};

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({
    sent: 0,
    failed: 0,
    total: 0,
    completed: false
  });

  const uploadExcel = async (file: File) => {
    if (!credentials) {
      toast({
        title: "Error",
        description: "Please fill in your credentials first",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fullName", credentials.fullName);
      formData.append("email", credentials.email);

      // Create a response to avoid fetch directly due to formData
      const response = await fetch("/api/excel/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload file");
      }

      const data = await response.json();
      
      setRecipients(data.recipients);
      setBatchId(data.batchId);
      
      toast({
        title: "Success",
        description: "Excel file uploaded successfully",
      });
      
      // Move to next step
      setCurrentStep(2);
    } catch (error) {
      toast({
        title: "Error uploading file",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const sendEmails = async () => {
    if (!credentials || !batchId) {
      toast({
        title: "Error",
        description: "Missing credentials or recipient data",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    setSendingProgress({
      sent: 0,
      failed: 0,
      total: recipients.length,
      completed: false
    });

    // Move to sending view
    setCurrentStep(3);

    try {
      // Make a POST request to initiate email sending
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials,
          batchId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize email sending');
      }
      
      // Now connect to SSE stream to get updates
      let eventSource = new EventSource(`/api/send/status?batchId=${batchId}`);
      
      // Handle connection open
      eventSource.onopen = () => {
        console.log('SSE connection established');
      };
      
      // Handle different event types
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        
        switch (data.type) {
          case 'init':
            setSendingProgress(prev => ({
              ...prev,
              total: data.totalEmails,
              sent: data.sent || 0,
              failed: data.failed || 0
            }));
            break;
            
          case 'update':
            // Update recipient status
            setRecipients(prev => 
              prev.map(recipient => 
                recipient.email === data.email 
                  ? { ...recipient, status: data.status } 
                  : recipient
              )
            );
            
            // Update progress
            setSendingProgress(prev => ({
              ...prev,
              sent: data.sent,
              failed: data.failed
            }));
            
            // Show toast for each sent email
            if (data.status === 'sent') {
              toast({
                title: "Email Sent",
                description: `Email to ${data.email} sent successfully!`,
              });
            } else {
              toast({
                title: "Email Failed",
                description: `Failed to send email to ${data.email}`,
                variant: "destructive"
              });
            }
            break;
            
          // Add a periodic status update event
          case 'status':
            // Update progress without toasts
            setSendingProgress(prev => ({
              ...prev,
              sent: data.sent,
              failed: data.failed
            }));
            
            // Update all recipients statuses
            if (data.recipients) {
              setRecipients(prev => {
                const newRecipients = [...prev];
                
                // Update statuses based on received data
                data.recipients.forEach((r: any) => {
                  const index = newRecipients.findIndex(nr => nr.email === r.email);
                  if (index !== -1) {
                    newRecipients[index].status = r.status;
                  }
                });
                
                return newRecipients;
              });
            }
            break;
            
          case 'error':
            toast({
              title: "Error",
              description: data.message,
              variant: "destructive"
            });
            break;
            
          case 'complete':
            setSendingProgress({
              sent: data.sent,
              failed: data.failed,
              total: data.total,
              completed: true
            });
            
            toast({
              title: "Sending Complete",
              description: `Sent: ${data.sent} | Failed: ${data.failed} | Total: ${data.total}`,
            });
            
            // Close the connection
            eventSource.close();
            setIsSending(false);
            break;
        }
      };
      
      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        toast({
          title: "Connection Error",
          description: "Lost connection to server. The emails may still be sending in the background.",
          variant: "destructive"
        });
        
        // Try to reconnect
        setTimeout(() => {
          try {
            // Re-establish SSE connection
            const newEventSource = new EventSource(`/api/send/status?batchId=${batchId}`);
            eventSource.close();
            eventSource = newEventSource;
            
            // Set up handlers again
            eventSource.onopen = () => {
              console.log('SSE connection re-established');
              toast({
                title: "Connection Restored",
                description: "Reconnected to the email sending service"
              });
            };
            
            eventSource.onmessage = handleMessage;
            eventSource.onerror = handleError;
          } catch (e) {
            console.error('Failed to reconnect SSE:', e);
            setIsSending(false);
          }
        }, 3000);
      };
      
      // Define handlers as named functions for reuse
      const handleMessage = eventSource.onmessage;
      const handleError = eventSource.onerror;
      
    } catch (error) {
      setIsSending(false);
      toast({
        title: "Error sending emails",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const downloadSample = () => {
    window.location.href = "/api/excel/sample";
  };

  return (
    <EmailContext.Provider
      value={{
        credentials,
        setCredentials,
        recipients,
        setRecipients,
        batchId,
        setBatchId,
        currentStep,
        setCurrentStep,
        isUploading,
        uploadExcel,
        isSending,
        sendingProgress,
        sendEmails,
        downloadSample
      }}
    >
      {children}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}
