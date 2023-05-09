import { Document } from 'langchain/document';

export type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  typed?: boolean;
  isStreaming?: boolean;
  sourceDocs?: Document[];
};
