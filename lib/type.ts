export type Model = "llama3:instruct" | "llama3:70b-instruct" | "llava:13b";

type TextContent = {
  type: "text";
  text: string;
};

type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

type Content = TextContent | ImageContent;

export type Prompt = {
  content: Content[];
};
