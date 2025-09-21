"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Loader2, Info, Activity, ShieldCheck, BrainCircuit } from 'lucide-react';
import { getAIAssistantResponseAction } from "@/lib/actions";
import type { Message, AIOperatorAssistantResponse } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

type AIAssistantProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentMetrics: {
    temperature: number;
    oxygenLevel: number;
    energyConsumption: number;
  };
};

const AssistantMessage = ({ message }: { message: AIOperatorAssistantResponse }) => {
    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Activity className="size-5 mt-1 text-primary" />
                        <div>
                            <h4 className="font-semibold">Summary</h4>
                            <p className="text-sm text-muted-foreground">{message.summary}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <Info className="size-5 mt-1 text-primary" />
                        <div>
                            <h4 className="font-semibold">Anomaly Explanation</h4>
                            <p className="text-sm text-muted-foreground">{message.anomalyExplanation}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="size-5 mt-1 text-primary" />
                        <div>
                            <h4 className="font-semibold">Corrective Actions</h4>
                            <p className="text-sm text-muted-foreground">{message.correctiveActions}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Accordion type="single" collapsible>
                <AccordionItem value="reasoning">
                    <AccordionTrigger className="text-sm">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="size-4" />
                            View Reasoning
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground p-2 bg-background/50 rounded-md">
                        {message.reasoning}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default function AIAssistant({ isOpen, onOpenChange, currentMetrics }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I'm your AI Operator Assistant. Ask me for a status summary, or about any issues you're seeing."
    }
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      const response = await getAIAssistantResponseAction({
        query: input,
        ...currentMetrics,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] flex flex-col">
        <SheetHeader>
          <SheetTitle>AI Operator Assistant</SheetTitle>
          <SheetDescription>
            Your AI partner for monitoring and managing kiln operations.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    {typeof message.content === 'string' ? <p>{message.content}</p> : <AssistantMessage message={message.content} />}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback><User size={18} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isPending && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18} /></AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-2 bg-secondary flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g., 'Summarize current status.'"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !input.trim()}>
              Send
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
