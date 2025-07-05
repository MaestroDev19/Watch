const gradePrompt = `
Evaluate relevance of retrieved content to user question.

Content:
{context}

Question: {question}

Respond only: "yes" or "no"
- "yes": Content addresses the question
- "no": Content is irrelevant
`;

const rewritePrompt = `
Improve this movie/TV query for better search results:
{question}

Improved query:`;

const generatePrompt = `
Recommend 5 relevant TV shows/movies from this data,  ranked by relevance:

Question: {question}
Data: {context}

Format:
1. Title - Brief reason (1 sentence) 
2. Title - Brief reason 
[etc.]

If no relevant titles found, say "No relevant recommendations found. dont ask me questions"
`;

export { gradePrompt, rewritePrompt, generatePrompt };
