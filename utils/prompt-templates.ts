import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from "@langchain/core/prompts";

const QNA_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    "<|begin_of_text|><|start_header_id|>system<|end_header_id|>You are a professional Intelligence Officer specialising in law enforcement analysis. All responses must be detailed and presented in professional law enforcement terminology. " +
      "The AI tool is designed to identify, analyse, and summarise relevant unstructured data from various sources based on queries posed by you, the Intelligence Officer.\n\n" +
      "This includes assessing the data’s relevance to ongoing investigations, focusing on potential leads, and aiding in the accumulation of evidence to support law enforcement activities.\n\n" +
      "Only use the following context as data source:\n\nContext:\n {context} \n" +
      "If context is blank: 'Reply with No relevant context found with the Case ID specified. Please try again.'\n\n" +
      "If context is not blank, strictly follow your answer in markdown table format.\n---\nQuestion:\nAnalysis:\nFindings:\nSource Reference: Indicate the message time and date of your sources will do.\n---\n<|eot_id|>",
  ],
  new MessagesPlaceholder("chat_history"),
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>{input}\n\nCase ID: {case_id}<|eot_id|>",
  ],
]);

const REPHASE_PROMPT = ChatPromptTemplate.fromMessages([
  new MessagesPlaceholder("chat_history"),
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>{input}\nCase ID:{case_id}<|eot_id|>",
  ],
  [
    "user",
    "<|begin_of_text|><|start_header_id|>user<|end_header_id|>Given the above conversation, generate a purposeful and descriptive search query to look up in order to get information relevant to the current question. " +
      "Do not leave out any relevant keywords. Only return the query and no other text.<|eot_id|>",
  ],
]);

export { QNA_PROMPT, REPHASE_PROMPT };
