"use client"

import {
  WandSparkles,
  PlusCircle,
  Trash,
  Link
} from "lucide-react"
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import type { PutBlobResult } from '@vercel/blob';

interface Field {
  prompt: string;
  completion: string;
  [key: string]: string;
}

const App: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([{ prompt: '', completion: '' }]);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [publishedUrl, setPublishedUrl] = useState<string>('');

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const values = [...fields];
    values[index][event.target.name] = event.target.value;
    setFields(values);
    setJsonOutput(JSON.stringify(values, null, 2));
  };

  const handleJsonChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    try {
      const parsedJson = JSON.parse(JSON.stringify(event.target.value, null, 2));
      setFields(parsedJson);
      setJsonOutput(event.target.value);
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const handleAddField = () => {
    const values = [...fields];
    values.push({ prompt: '', completion: '' });
    setFields(values);
    setJsonOutput(JSON.stringify(values, null, 2));
  };

  const handleRemoveField = (index: number) => {
    const values = [...fields];
    values.splice(index, 1);
    setFields(values);
    setJsonOutput(JSON.stringify(values, null, 2));
  };

  const jsonlOutput = fields.map((field) => JSON.stringify(field)).join('\n');

  const handleDownloadJsonl = () => {
    const element = document.createElement('a');
    const file = new Blob([jsonlOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'data.jsonl';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePublish = async () => {
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonlOutput,
      });

      if (response.ok) {
        const newUrl = await response.json();
        setPublishedUrl(newUrl);
      } else {
        console.error('Error publishing data');
      }
    } catch (error) {
      console.error('Error publishing data:', error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 text-lg font-medium md:text-sm">
        <WandSparkles className="h-6 w-6 hover:animate-magic-short" />
        TuneUp - training data generator
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <p className="text-sm">
          Use the designer or edit the JSON directly to generate a JSONL file that you can use as training data to fine tune large language models (LLM).
        </p>
        <div className="grid gap-2 md:gap-4 lg:grid-cols-2 xl:grid-cols-2">
          <Card className="relative h-full min-h-[80vh]">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 mb-1">
              <h3 className="font-semibold leading-none tracking-tight">Designer</h3>
            </div>
            <CardContent className="overflow-y-auto space-y-4 h-[70vh]">
              {fields.map((field, index) => (
                <Card key={index} className="p-4 flex">
                    <div className="flex flex-col items-center mr-2">
                      <div className="h-8 w-8 bg-black rounded-full flex justify-center items-center text-white my-2">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <Trash 
                        onClick={() => handleRemoveField(index)}
                        className="h-4 w-4 my-2 hover:cursor-pointer hover:stroke-red-600"
                        />
                    </div>
                    <CardContent className="flex-1 p-2 pt-0">
                      <Input
                        type="text"
                        name="prompt"
                        placeholder="Enter prompt"
                        value={field.prompt}
                        onChange={(event) => handleInputChange(index, event)}
                        className="col-span-4 h-10 my-2"
                      />
                      <Input
                        type="text"
                        name="completion"
                        placeholder="Enter completion"
                        value={field.completion}
                        onChange={(event) => handleInputChange(index, event)}
                        className="col-span-4 h-10 my-1"
                      />
                    </CardContent>
                </Card>
              ))}
            </CardContent>
            <CardFooter className="justify-center border-t p-4">
              <Button size="sm" variant="ghost" className="gap-1" onClick={handleAddField}>
                <PlusCircle className="h-3.5 w-3.5" />
                Add New
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="p-6 items-center justify-between space-y-0 mb-1">
              <Tabs defaultValue="json">
                <TabsList>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                  <TabsTrigger value="jsonl">JSONL</TabsTrigger>
                </TabsList>
                <TabsContent value="json">
                  <Textarea
                    value={jsonOutput}
                    onChange={handleJsonChange}
                    className="w-full h-60 mb-4 font-mono"
                  />
                </TabsContent>
                <TabsContent value="jsonl">
                  <Textarea
                    value={jsonlOutput}
                    readOnly
                    className="w-full h-60 mb-4 font-mono"
                  />
                </TabsContent>
              </Tabs>
              <div className="flex items-center space-x-2">
                <Button onClick={handleDownloadJsonl} variant="outline" className="w-full mb-4">Download JSONL</Button>
                <Button onClick={handlePublish} className="w-full mb-4">Publish Training Data</Button>
              </div>
              {publishedUrl && (
                <Alert className="border-yellow-400 bg-yellow-100 border-2">
                  <WandSparkles className="h-6 w-6 hover:animate-magic-short" />
                  <AlertTitle>Published URL</AlertTitle>
                  <AlertDescription>
                    <a href={publishedUrl} target="_blank" 
                      className="whitespace-normal text-pretty break-words my-4 hover:underline" 
                      rel="noopener noreferrer">
                      {publishedUrl}
                    </a>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
};

export default App;
