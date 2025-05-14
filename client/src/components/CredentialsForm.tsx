import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEmail } from "@/hooks/use-email";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InfoIcon, ArrowRightIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { credentialsSchema, CredentialsSchema } from "@/lib/validators";

export default function CredentialsForm() {
  const { setCredentials, setCurrentStep } = useEmail();
  const [showTooltip, setShowTooltip] = useState(false);

  const form = useForm<CredentialsSchema>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: CredentialsSchema) {
    setCredentials(data);
    setCurrentStep(2);
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Gmail Authentication Details</h2>
        <p className="text-sm text-gray-600 mt-1">Please enter your Gmail credentials to proceed</p>
      </div>

      <div className="p-6">
        {/* Top image/illustration */}
        <div className="flex justify-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&h=450" 
            alt="Email marketing illustration" 
            className="rounded-lg shadow-sm h-48 object-cover" 
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gmail Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="youremail@gmail.com" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-sm text-gray-500 mt-1">Only Gmail addresses (@gmail.com) are supported</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormLabel>Gmail App Password</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                          <InfoIcon className="h-4 w-4 text-gray-400 hover:text-primary-500" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4">
                        <h3 className="font-medium text-gray-800 text-sm mb-2">How to Generate Gmail App Password</h3>
                        <ol className="text-xs text-gray-600 space-y-2 pl-4 list-decimal">
                          <li>Go to your Google Account: <a href="https://myaccount.google.com" target="_blank" className="text-primary-600 hover:text-primary-700">myaccount.google.com</a></li>
                          <li>Select "Security" from the left navigation panel</li>
                          <li>Under "Signing in to Google," select "2-Step Verification"</li>
                          <li>At the bottom of the page, select "App passwords"</li>
                          <li>Enter a name for the app password (e.g., "Bulk Mailer")</li>
                          <li>Click "Create" and copy the 16-character password</li>
                        </ol>
                        <p className="text-xs text-gray-500 mt-2">Note: You must have 2-Step Verification enabled for your Google Account.</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Your Gmail App Password" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" className="flex items-center">
                <ArrowRightIcon className="mr-2 h-4 w-4" />
                Continue to Upload
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
