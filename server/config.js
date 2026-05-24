import "dotenv/config";

export const PORT = 3001;
export const JWT_SECRET = process.env.JWT_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;
export const IS_PRODUCTION = process.env.NODE_ENV === "production";
