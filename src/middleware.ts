
import { NextResponse, type NextRequest } from 'next/server';
import { verifyJWT, type UserPayload } from '@/lib/auth';

// By extending the NextRequest, we can add our custom user property to it.
interface RequestWithUser extends NextRequest {
    user?: UserPayload;
}

export async function middleware(request: RequestWithUser) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  // For demonstration, we'll assume all API routes starting with /api/protected require authentication.
  // In a real app, you would have more sophisticated logic here.
  if (!token) {
    // If no token is provided, return an unauthorized error.
    return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Verify the token using our placeholder function.
    const payload = await verifyJWT(token);
    // Attach the user payload to the request object for use in API routes.
    request.user = payload;
    
    // If the token is valid, proceed to the requested route.
    return NextResponse.next();
  } catch (error) {
    // If token verification fails, return an invalid token error.
    return new Response(
        JSON.stringify({ success: false, message: 'Invalid token' }),
        { status_code: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// See "Matching Paths" below to learn more
export const config = {
  // Define the routes that this middleware will apply to.
  matcher: '/api/protected/:path*',
};
