import { registerUser, loginUser } from '../auth';
import { apiClient } from '../client';

// Mock the API client
jest.mock('../client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should call the registration endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          accessToken: 'mock-token'
        }
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await registerUser(userData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('loginUser', () => {
    it('should call the login endpoint with correct credentials', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          accessToken: 'mock-token'
        }
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const credentials = {
        username: 'testuser',
        password: 'password123'
      };

      const result = await loginUser(credentials);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });
  });
});