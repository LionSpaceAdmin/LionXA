
import { type NextRequest } from "next/server";

// This is a dummy user payload. In a real application, this would be decoded from a JWT.
export interface UserPayload {
    id: string;
    username: string;
    roles: string[];
}

/**
 * A placeholder function to simulate JWT verification.
 * In a real-world scenario, this function would use a library like 'jsonwebtoken' or 'jose'
 * to verify the token against a secret key and return the decoded payload.
 * @param token The JWT token string.
 * @returns A promise that resolves with the user payload.
 */
export async function verifyJWT(token: string): Promise<UserPayload> {
    console.log("DUMMY: Verifying token:", token);
    // Simulate async verification process
    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real app, if verification fails, you would throw an error here.
    
    // Return a mock user payload
    return {
        id: "user-123",
        username: "demo_user",
        roles: ["admin"],
    };
}
