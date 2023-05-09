/**
 * Change the namespace to the namespace on Pinecone you'd like to store your embeddings.
 */

if (!process.env.PINECONE_INDEX_NAME) {
  console.log('Missing Pinecone index name in .env file');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const PINECONE_NAME_SPACE = 'test-name'; //namespace for your vectors



export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE };
