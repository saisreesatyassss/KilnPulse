"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { generateVisualSummaryAction } from '@/lib/actions';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
    description: z.string().min(20, "Please provide a more detailed description for a better visual summary."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VisualSummaryPage() {
    const [isPending, startTransition] = useTransition();
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: "The primary kiln temperature is currently high at 310°C, exceeding the 300°C threshold. Simultaneously, the oxygen level has dropped to 8%, which is below the safe limit of 10%. As a result, the system is automatically reducing the fuel feed rate and increasing the speed of the primary air fan to stabilize conditions.",
        },
    });

    const onSubmit = (values: FormValues) => {
        setImageUrl(null);
        startTransition(async () => {
            const response = await generateVisualSummaryAction(values);
            if (response.imageUrl) {
                setImageUrl(response.imageUrl);
            }
        });
    };

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-2xl font-bold tracking-tight">Dynamic Visual Process Summaries</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="lg:col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Generate a Visual Summary</CardTitle>
                            <CardDescription>Describe a process, alert, or log, and the AI will create a diagram.</CardDescription>
                        </CardHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <CardContent>
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Process Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        rows={10}
                                                        placeholder="e.g., High temperature alert in preheater stage 4..."
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
                                        Generate Diagram
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>

                    <Card className="lg:col-span-2 md:col-span-2">
                        <CardHeader>
                            <CardTitle>Generated Diagram</CardTitle>
                            <CardDescription>Your visual summary will appear below.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            {isPending && (
                                <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
                                     <Skeleton className="h-[400px] w-full" />
                                    <p className="text-lg text-muted-foreground">Generating your visual summary...</p>
                                    <p className='text-sm text-muted-foreground'>(This may take up to a minute)</p>
                                </div>
                            )}
                            {!isPending && !imageUrl && (
                                <div className="flex flex-col items-center justify-center h-[400px] w-full border-2 border-dashed rounded-lg">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold">Ready to Visualize</h3>
                                    <p className="text-muted-foreground">Enter a description to generate a diagram.</p>
                                </div>
                            )}
                            {imageUrl && (
                                <div className="relative w-full aspect-video">
                                    <Image
                                        src={imageUrl}
                                        alt="Generated Process Summary Diagram"
                                        fill
                                        style={{objectFit: "contain"}}
                                        className="rounded-lg"
                                        unoptimized
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
