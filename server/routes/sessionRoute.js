import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
const router = Router();

router.post('/gemini-token', async (req, res, next) => {
  try {
    const client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1alpha' }, 
    });

    // const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    const token = await client.authTokens.create({
        config: {
            uses: 1,
            expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
            httpOptions: { apiVersion: 'v1alpha' },
        },
        });

    res.json({ token: token.name });
  } catch (err) {
    next(err);
  }
});

export default router;