import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Navbar from "@/components/Navbar";
import { smartContractService } from "@/services/smartContractService";

const CreateMatch = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        if (typeof window.ethereum === "undefined") {
          navigate("/");
          return;
        }

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (!accounts || accounts.length === 0) {
          navigate("/");
          return;
        }

        const isAdmin = await smartContractService.isAdmin(accounts[0]);
        if (!isAdmin) {
          toast({
            title: "Unauthorized Access",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking authorization:", error);
        navigate("/");
      }
    };

    checkAuthorization();
  }, [navigate, toast]);

  const form = useForm({
    defaultValues: {
      home: "",
      away: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      console.log("Creating match:", values);
      await smartContractService.createMatch(values.home, values.away);
      toast({
        title: "Match Created Successfully",
        description: "The match has been created on the blockchain.",
      });
      navigate("/available");
    } catch (error) {
      console.error("Error creating match:", error);
      toast({
        title: "Error Creating Match",
        description: "There was an error creating the match. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-6 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <h1 className="text-3xl font-bold text-secondary">Create a New Match</h1>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="home"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Team</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="away"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Away Team</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Creating Match..." : "Create Match"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateMatch;