import { useState, useRef, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";
import { usePlaygroundSettings } from "@/lib/hooks";
import { toast } from "sonner";
import short from "short-uuid";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export default function MicrophoneButton() {
  const mediaRec = useRef<null | MediaRecorder>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const { setChatFiles } = usePlaygroundSettings();
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);

  useEffect(() => {
    async function loadFFMpeg() {
      if (typeof window !== "undefined") {
        const instance = new FFmpeg();
        if (!instance.loaded) {
          await instance.load();
          setFFmpeg(instance);
        }
      }
    }
    loadFFMpeg();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRec.current = new MediaRecorder(stream);
      mediaRec.current.start();
      setIsRecording(true);

      mediaRec.current.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };

      mediaRec.current.onstop = async () => {
        const uuid = short.generate();
        const audioBlob = new Blob(audioChunks.current, { type: "audio/mpeg" });
        await convertToMp3(audioBlob, uuid);
      };

      const convertToMp3 = async (blob: Blob, uuid: string) => {
        if (!ffmpeg) return;

        await ffmpeg.writeFile("recording.webm", await fetchFile(blob));

        await ffmpeg.exec([
          "-i",
          "recording.webm",
          "-b:a",
          "192K",
          "-vn",
          `${uuid}.mp3`,
        ]);

        const mp3FileBuffer = await ffmpeg.readFile(`${uuid}.mp3`);
        const mp3Blob = new Blob([mp3FileBuffer], { type: "audio/mpeg" });

        setChatFiles((prev) => [
          ...prev,
          new File([mp3Blob], `${uuid}.mp3`, { type: "audio/mpeg" }),
        ]);

        audioChunks.current = [];
      };
    } catch (e) {
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRec.current) {
      mediaRec.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          type="button"
          className={`${isRecording ? "cursor-progress" : ""}`}
        >
          <Mic className={`${isRecording && "text-gray-500"} size-4`} />
          <span className="sr-only">
            {isRecording ? "Release to Stop" : "Press and Hold to Record"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {isRecording ? "Release to Stop" : "Press and Hold to Record"}
      </TooltipContent>
    </Tooltip>
  );
}
