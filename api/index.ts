// Vercel serverless function entry point
// Re-export the handler from backend package
import handler from '../packages/backend/api/index';
export default handler;
