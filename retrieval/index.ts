import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Environment variables (will be set via .env)
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'mediphant-test';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChunkData {
  id: string;
  text: string;
  metadata: {
    source: string;
    chunk_index: number;
  };
}

class MedicalCorpusIndexer {
  private pinecone: Pinecone;
  private openai: OpenAI;

  constructor() {
    if (!PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });

    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  /**
   * Split corpus into sentence-level chunks
   */
  private chunkText(text: string): ChunkData[] {
    const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));

    return lines
      .map((line, index) => ({
        id: `chunk-${index}`,
        text: line.trim(),
        metadata: {
          source: 'corpus.md',
          chunk_index: index,
        },
      }))
      .filter(chunk => chunk.text.length > 0);
  }

  /**
   * Generate embeddings using OpenAI
   */
  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts,
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  /**
   * Upsert vectors to Pinecone
   */
  private async upsertToPinecone(chunks: ChunkData[], embeddings: number[][]): Promise<void> {
    try {
      const index = this.pinecone.index(PINECONE_INDEX);

      const vectors = chunks.map((chunk, i) => ({
        id: chunk.id,
        values: embeddings[i],
        metadata: {
          text: chunk.text,
          ...chunk.metadata,
        },
      }));

      await index.upsert(vectors);
      console.log(`Successfully upserted ${vectors.length} vectors to Pinecone`);
    } catch (error) {
      console.error('Error upserting to Pinecone:', error);
      throw error;
    }
  }

  /**
   * Main indexing function
   */
  async indexCorpus(): Promise<void> {
    try {
      console.log('Starting corpus indexing...');

      // Read corpus file
      const corpusPath = path.join(__dirname, 'corpus.md');
      const corpusText = fs.readFileSync(corpusPath, 'utf-8');
      console.log(`Read corpus file: ${corpusText.length} characters`);

      // Chunk text
      const chunks = this.chunkText(corpusText);
      console.log(`Created ${chunks.length} chunks`);

      if (chunks.length === 0) {
        throw new Error('No chunks created from corpus');
      }

      // Generate embeddings
      console.log('Generating embeddings...');
      const embeddings = await this.generateEmbeddings(chunks.map(c => c.text));
      console.log(`Generated ${embeddings.length} embeddings`);

      // Upsert to Pinecone
      console.log('Upserting to Pinecone...');
      await this.upsertToPinecone(chunks, embeddings);

      console.log('Corpus indexing completed successfully!');
    } catch (error) {
      console.error('Error during indexing:', error);
      throw error;
    }
  }

  /**
   * Test connection to Pinecone
   */
  async testConnection(): Promise<void> {
    try {
      const indexStats = await this.pinecone.index(PINECONE_INDEX).describeIndexStats();
      console.log('Pinecone connection successful. Index stats:', indexStats);
    } catch (error) {
      console.error('Failed to connect to Pinecone:', error);
      throw error;
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const indexer = new MedicalCorpusIndexer();

  try {
    switch (command) {
      case 'test':
        await indexer.testConnection();
        break;
      case 'index':
        await indexer.indexCorpus();
        break;
      default:
        console.log(`
Usage:
  npx tsx index.ts test    # Test Pinecone connection
  npx tsx index.ts index   # Index the corpus
        `);
        break;
    }
  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MedicalCorpusIndexer };