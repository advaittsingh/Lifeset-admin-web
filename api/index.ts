// Vercel serverless function entry point
// Re-export the handler from backend-standalone package
import handler from '../backend-standalone/api/index';
export default handler;

