# Testing queryGemini Function

## Quick Setup

1. Install required dependencies:
```bash
cd frontend
npm install dotenv tsx --save-dev
```

2. Make sure your `.env.local` file has the Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

3. Run the test:
```bash
npx tsx test-gemini.ts
```

## What the test does

- Uses mock Pinecone results (2 sample job matches)
- Sends a sample Full Stack Developer job description
- Calls your `queryGemini` function with test data
- Prints the AI response to console

## Customizing the test

Edit `test-gemini.ts`:
- Change `sampleJobDescription` to test different JDs
- Modify `mockPineconeResults` to test different job matches
- Update `testParams` for different locations/roles/pay

## Expected output

You should see:
1. The prompt being sent
2. Raw Gemini response
3. Parsed JSON result with filtered jobs and wage level
