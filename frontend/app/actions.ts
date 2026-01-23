"use server";
import { Pinecone } from "@pinecone-database/pinecone";

export async function getWageLevels(params: any) {
    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX;
    const indexHost = process.env.PINECONE_HOST;

    if (!apiKey || !indexName || !indexHost || !params?.jobDescription) {
        throw new Error("Missing PINECONE_API_KEY, PINECONE_INDEX, or PINECONE_HOST");
    }

    const pc = new Pinecone({ apiKey });
    
    // Using the Inference API pattern as requested
    const index = pc.index(indexName, indexHost);
    
    // Note: If you are using namespaces, add .namespace("your-namespace")
    const results = await index.searchRecords({
        query: {
            topK: 5,
            inputs: { text: params.jobDescription || "General search" }, // Search using the occupation
        },
        fields: ['description', 'title', 'value'], // Adjust fields based on your actual data
    });

    console.log("Pinecone Results:", results);

    return {
        success: true,
        data: results
    };
}