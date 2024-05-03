import React, { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { FileText, Paperclip } from "lucide-react";
import { Input } from "./ui/input";

export default function UploadFilesButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Upload file</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Upload File</TooltipContent>
      </Tooltip>
      <DropdownMenuContent>
        <DropdownMenuLabel>Upload File(s)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Button
          className="bg-transparent flex justify-between gap-x-1 text-black hover:bg-gray-100 w-full"
          onClick={handleFileInputClick}
        >
          <span>Text/Image</span>

          <FileText className="h-5 w-5" />
          <Input
            type="file"
            accept="text/plain, .txt, image/*"
            name="fileInput"
            className="hidden"
            ref={fileInputRef}
          />
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
