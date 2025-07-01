"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const formSchema = z.object({
  query: z.string().min(1, {
    message: "Query is required",
  }),
});

const loadingTexts: string[] = [
  "Locking in...",
  "Cooking...",
  "Chill, I got you...",
  "Almost ready...",
];

export default function Recommend() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);
  const [textIndex, setTextIndex] = useState(0);
  const [response, setResponse] = useState<any | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  // Effect to cycle through loading texts when loading
  useEffect(() => {
    if (!isLoading) {
      setTextIndex(0);
      setLoadingText(loadingTexts[0]);
      return;
    }

    const interval = setInterval(() => {
      setTextIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % loadingTexts.length;
        setLoadingText(loadingTexts[nextIndex]);
        return nextIndex;
      });
    }, 2000); // Change text every 2 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log(values);
    setResponse(null);
    // Simulate loading for demo purposes
    setTimeout(() => {
      setIsLoading(false);
      setResponse({
        title: "The Matrix",
        description:
          "A sci-fi action film about a hacker who discovers a conspiracy.",
        image: "https://via.placeholder.com/150",
        link: "https://www.google.com",
      });
    }, 8000); // 8 seconds to see the text cycling
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8">
      <div className="flex items-center space-x-2 mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormControl>
                      <Input
                        className="py-6 col-span-1 md:col-span-2"
                        placeholder="e.g. 'action', 'comedy', 'drama'"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="py-6 whitespace-nowrap min-w-0 flex-shrink-0"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin flex-shrink-0" />
                    <span className="truncate">{loadingText}</span>
                  </>
                ) : (
                  "Get Recs"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {response && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos.
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
