import { createGreenhouse, getUserGreenhouse } from '../greenhouse';
import { apiClient } from '../client';

// Mock the API client
jest.mock('../client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Greenhouse API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGreenhouse', () => {
    it('should call the greenhouse setup endpoint with correct data', async () => {
      const mockResponse = {
        data: {
          id: '1',
          userId: 'user1',
          name: 'Test Greenhouse',
          location: 'Test Location',
          description: 'Test Description',
          zones: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      mockedApiClient.post.mockResolvedValue(mockResponse);

      const greenhouseData = {
        name: 'Test Greenhouse',
        location: 'Test Location',
        description: 'Test Description',
        zones: [{ name: 'Zone 1', description: 'First zone' }]
      };

      const result = await createGreenhouse(greenhouseData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/greenhouse/setup', greenhouseData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserGreenhouse', () => {
    it('should call the greenhouse endpoint and return data', async () => {
      const mockResponse = {
        data: {
          id: '1',
          userId: 'user1',
          name: 'Test Greenhouse',
          location: 'Test Location',
          zones: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await getUserGreenhouse();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/greenhouse');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return null when greenhouse not found (404)', async () => {
      const error = { statusCode: 404 };
      mockedApiClient.get.mockRejectedValue(error);

      const result = await getUserGreenhouse();

      expect(result).toBeNull();
    });

    it('should throw error for other status codes', async () => {
      const error = { statusCode: 500, message: 'Server error' };
      mockedApiClient.get.mockRejectedValue(error);

      await expect(getUserGreenhouse()).rejects.toEqual(error);
    });
  });
});