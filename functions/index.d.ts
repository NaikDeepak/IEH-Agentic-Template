import { Request, Response } from 'express';
import { HttpsFunction } from 'firebase-functions/v2/https';

export declare const generateJdHandler: (req: Request, res: Response) => Promise<void | Response>;
export declare const embeddingHandler: (req: Request, res: Response) => Promise<void | Response>;
export declare const searchJobsHandler: (req: Request, res: Response) => Promise<void | Response>;
export declare const generateEmbedding: (text: string, apiKey: string) => Promise<number[]>;
export declare const api: HttpsFunction;
