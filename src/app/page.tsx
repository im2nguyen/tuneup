"use client"

import {
  WandSparkles,
  PlusCircle,
  Trash,
  Bomb
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface Field {
  prompt?: string;
  completion?: string;
  text?: string;
}

const App: React.FC = () => {
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [selectedModelType, setSelectedModelType] = useState<string>("instructions");
  const [fields, setFields] = useState<{ prompt?: string; completion?: string; text?: string }[]>(
    selectedModelType === "instructions" ? [{ prompt: "", completion: "" }] : [{ text: "" }]
  );

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const values = [...fields];
    if (selectedModelType === "instructions") {
      values[index] = {
        ...values[index],
        prompt: event.target.name === "prompt" ? event.target.value : values[index].prompt,
        completion: event.target.name === "completion" ? event.target.value : values[index].completion,
      };
    } else {
      values[index] = {
        ...values[index],
        text: event.target.value,
      };
    }
    setFields(values);
    setJsonOutput(JSON.stringify(values, null, 2));
  };

  const handleTextAreaChange = (index: number, event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const values = [...fields];
    if (selectedModelType === "instructions") {
      values[index] = {
        ...values[index],
        prompt: event.target.name === "prompt" ? event.target.value : values[index].prompt,
        completion: event.target.name === "completion" ? event.target.value : values[index].completion,
      };
    } else {
      values[index] = {
        ...values[index],
        text: event.target.value,
      };
    }
    setFields(values);
    setJsonOutput(JSON.stringify(values, null, 2));
  };

  const resetFields = () => {
    setFields(selectedModelType === "instructions" ? [{ prompt: "", completion: "" }] : [{ text: "" }]);
    setJsonOutput(selectedModelType === "instructions" ? JSON.stringify([{ prompt: "", completion: "" }], null, 2) : JSON.stringify([{ text: "" }], null, 2));
  };

  const updateFieldsForInstructionsModel = () => {
    const instructionsFields = fields.map((field) => ({
      prompt: field.prompt || "",
      completion: field.completion || "",
    }));
    setFields(instructionsFields);
    setJsonOutput(JSON.stringify(instructionsFields, null, 2));
  };

  const updateFieldsForAutocompleteModel = () => {
    const autocompleteFields = fields.map((field) => ({
      text: field.text || "",
    }));
    setFields(autocompleteFields);
    setJsonOutput(JSON.stringify(autocompleteFields, null, 2));
  };

  const handleJsonChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    try {
      const jsonValue = typeof event.target.value === 'string' ? event.target.value : '';
      const parsedJson = JSON.parse(jsonValue);

      // Validate the structure of parsedJson
      const isValidStructure =
        parsedJson.length > 0 &&
        parsedJson.every(
          (field: Field) =>
            (selectedModelType === "instructions" && field.prompt !== undefined && field.completion !== undefined) ||
            (selectedModelType === "autocomplete" && field.text !== undefined)
        );

      if (isValidStructure) {
        setFields(parsedJson);
        setJsonOutput(JSON.stringify(parsedJson, null, 2));
      } else {
        console.error('Invalid JSON structure');
      }
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  const handleAddField = () => {
    const newField: Field = selectedModelType === "instructions" ? { prompt: "", completion: "" } : { text: "" };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    setJsonOutput(JSON.stringify(updatedFields, null, 2));
  };

  const handleRemoveField = (index: number) => {
    const values = [...fields];
    values.splice(index, 1);
    setFields(values);
    setJsonOutput(JSON.stringify(values, null, 2));
  };

  const jsonlOutput = selectedModelType === "instructions"
    ? fields.map((field) => JSON.stringify({ prompt: field.prompt, completion: field.completion })).join("\n")
    : fields.map((field) => JSON.stringify({ text: field.text })).join("\n");

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
              <h3 className="font-semibold leading-none tracking-tight">
                Designer
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Badge className="mx-2 hover:animate-magic-short hover:bg-red-500">
                      Field Count: {fields.length}
                      <Bomb className="h-3 w-3 ml-2"></Bomb>
                    </Badge>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Do you want to reset all fields?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will reset and clear all fields. There will be no fields left.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetFields}>Reset Fields</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </h3>
              <Select value={selectedModelType} onValueChange={(value) => {
                setSelectedModelType(value);
                (value === "instructions") ? updateFieldsForInstructionsModel() : updateFieldsForAutocompleteModel();
              }}>
                <SelectTrigger className="w-2/4">
                  <SelectValue placeholder="Model type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructions">Instruction-tuned model</SelectItem>
                  <SelectItem value="autocomplete">Autocompleting model</SelectItem>
                </SelectContent>
              </Select>
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
                    {selectedModelType === "instructions" ? (
                      <>
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
                      </>
                    ) : (
                      <Textarea
                        name="text"
                        placeholder="Enter text"
                        value={field.text}
                        onChange={(event) => handleTextAreaChange(index, event)}
                        className="col-span-4 h-10 my-2"
                      />
                    )}
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="json" >JSON</TabsTrigger>
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
