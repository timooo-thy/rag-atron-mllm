import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const QNA_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>You are a professional Intelligence Officer specialising in law enforcement analysis. All responses must be detailed and presented in professional law enforcement terminology. " +
      "The AI tool is designed to identify, analyse, and summarise relevant unstructured data from various sources based on queries posed by you, the Intelligence Officer.\n\n" +
      "This includes assessing the data’s relevance to ongoing investigations, focusing on potential leads, and aiding in the accumulation of evidence to support law enforcement activities.\n\n" +
      "If the user query is about previous chat history, answer it accordingly and ignore the instructions below. Else," +
      "only use the following context as data source:\n\nContext:\n {context} \n" +
      "If context is blank: 'Reply with No relevant context found with the Case ID specified. Please try again.'\n\n" +
      "If context is not blank, strictly adhere your answer in markdown format with no additional text after it.\n---\nAnalysis: Analyse the context if available\nReferences: ONLY indicate the message, time and date of the sources relevant to the question in markdown table format.\n---\n Include the link of the URL at the end of the message.<|eot_id|>",
  ],
  new MessagesPlaceholder("chat_history"),
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>Case ID:{case_id}\n{input}<|eot_id|>\n" +
      "<|start_header_id|>assistant<|end_header_id|>",
  ],
]);

const IMAGE_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>You are a professional Intelligence Officer specialising in law enforcement analysis. " +
      "Only answer with the given context:\n---\n{context}\n---\nFor each context, decide if it's related to the user's query for which, please display the identified images in this format -> (![image_title](URL)) in proper markdown table format (Image and Description). Do not include any text after the table.\n\n" +
      "If context is blank, reply with 'No relevant context found with the Case ID specified. Please try again.'<|eot_id|>",
  ],
  new MessagesPlaceholder("chat_history"),
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>Case ID: {case_id}\n{input}<|eot_id|>\n" +
      "<|start_header_id|>assistant<|end_header_id|>",
  ],
]);

const REPHRASE_PROMPT = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("chat_history"),
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>Case ID:{case_id}\n{input}<|eot_id|>\n",
  ],
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>Given the above conversation, generate a purposeful and descriptive search query to look up in order to get information relevant to the current question. " +
      "Do not leave out any relevant keywords. Only return the query and no other text.<|eot_id|>" +
      "<|start_header_id|>assistant<|end_header_id|>",
  ],
]);

const RETRIEVER_PROMPT = ChatPromptTemplate.fromMessages([
  //TODO: Fix prompt
  [
    "system",
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>" +
      "Classify the type of user query into one of two categories: 'Image Lookup' or 'Case Analysis'.\n" +
      "If user did not ask anything image related, return 'Case Analysis'. " +
      "Only return the query type and no other text and quotations that best fit the user's query.<|eot_id|>",
  ],
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>{query}\n\n" +
      "<|start_header_id|>assistant<|end_header_id|>",
  ],
]);

const IMAGE_CLASSIFIER_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>" +
      "Classify the type of user query into one of two categories: 'Image Lookup' or 'Describe Image'.\n" +
      "Return 'Image Lookup' if user is trying to find similar images. Return 'Describe Image' if user wants to describe the images.\n" +
      "Only return the query type and no other text and quotations that best fit the user's query.<|eot_id|>",
  ],
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>{query}\n" +
      "<|start_header_id|>assistant<|end_header_id|>",
  ],
]);

export {
  QNA_PROMPT,
  REPHRASE_PROMPT,
  RETRIEVER_PROMPT,
  IMAGE_PROMPT,
  IMAGE_CLASSIFIER_PROMPT,
};
