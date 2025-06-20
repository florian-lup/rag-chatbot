import { getOpenAI } from '@/lib/clients/openai';
import { getPinecone } from '@/lib/clients/pinecone';
import { CHAT_CONFIG } from '@/lib/config';

export async function runSearchBio(query: string): Promise<string> {
  try {
    if (!query.trim()) return CHAT_CONFIG.noContextMessage;

    const openai = getOpenAI();
    const embed = await openai.embeddings.create({
      model: CHAT_CONFIG.embeddingModel,
      input: query,
    });
    const firstEmbedding = embed.data[0]?.embedding;
    if (!firstEmbedding) return CHAT_CONFIG.noContextMessage;

    const vector = firstEmbedding;

    const pinecone = getPinecone();
    const resp = await pinecone.index(CHAT_CONFIG.pineconeIndex).query({
      vector,
      topK: CHAT_CONFIG.topK,
      includeMetadata: true,
    });

    const matches = resp.matches;
    const chunks = matches
      .map(m => {
        const { text = '' } = m.metadata as { text?: string };
        return text;
      })
      .filter(Boolean);

    if (chunks.length === 0) return CHAT_CONFIG.noContextMessage;

    return chunks.join('\n\n');
  } catch (err) {
    console.error('Pinecone query error', err);
    return CHAT_CONFIG.noContextMessage;
  }
}
