import { useRef } from "react";
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
import { usePlaygroundSettings } from "@/lib/hooks";

export default function UploadFilesButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setChatFiles } = usePlaygroundSettings();

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
          <span>Image(s)</span>
          <FileText className="h-5 w-5" />
          <Input
            type="file"
            accept="image/png, image/jpeg, audio/mpeg"
            name="fileInput"
            className="hidden"
            ref={fileInputRef}
            multiple
            onChange={(e) => {
              e.target.files && setChatFiles(Array.from(e.target.files));
            }}
          />
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
