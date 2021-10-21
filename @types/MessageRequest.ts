export interface MessageRequest {
  address: string;
  message: string;
  timestamp: { toString(): string };
  imageUrl: string;
}
