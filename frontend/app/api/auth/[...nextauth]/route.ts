import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        accessToken: { label: 'Access Token', type: 'text' },
        isRegistration: { label: 'Is Registration', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // Handle registration flow - use provided token directly
        if (credentials.isRegistration === 'true' && credentials.accessToken) {
          try {
            // Verify the token by fetching user profile
            // Use internal Docker network URL for server-side calls
            const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const response = await axios.get(
              `${apiUrl}/auth/profile`,
              {
                headers: {
                  Authorization: `Bearer ${credentials.accessToken}`,
                },
              }
            );

            if (response.data && response.data.user) {
              return {
                id: response.data.user.id,
                name: response.data.user.name || response.data.user.username,
                email: response.data.user.email,
                accessToken: credentials.accessToken,
              };
            }

            return null;
          } catch (error) {
            console.error('Token verification error:', error);
            return null;
          }
        }

        // Handle login flow - authenticate with credentials
        if (!credentials.username || !credentials.password) {
          return null;
        }

        try {
          // Call backend authentication endpoint
          // Use internal Docker network URL for server-side calls
          const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
          
          console.log('🔐 NextAuth: Attempting login with backend');
          console.log('🌐 API URL:', apiUrl);
          console.log('👤 Username:', credentials.username);
          
          const response = await axios.post(
            `${apiUrl}/auth/login`,
            {
              username: credentials.username,
              password: credentials.password,
            }
          );

          console.log('✅ NextAuth: Backend response received');
          console.log('📦 Response data:', response.data);

          if (response.data && response.data.user) {
            console.log('✅ NextAuth: User authenticated successfully');
            return {
              id: response.data.user.id,
              name: response.data.user.name || response.data.user.username,
              email: response.data.user.email,
              accessToken: response.data.accessToken,
            };
          }

          console.log('❌ NextAuth: No user data in response');
          return null;
        } catch (error: any) {
          console.error('❌ NextAuth: Authentication error:', error?.message || error);
          if (error?.response) {
            console.error('🚨 Response status:', error.response.status);
            console.error('🚨 Response data:', error.response.data);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign in or token update, store the access token
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      
      // Support manual token updates (for registration flow)
      if (trigger === 'update' && (token as any).accessToken) {
        // Token is already updated, just return it
        return token;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
