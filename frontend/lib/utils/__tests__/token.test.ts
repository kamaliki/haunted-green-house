import { storeToken, getToken, removeToken, isAuthenticated } from '../token';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Token Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeToken', () => {
    it('should store token in localStorage', () => {
      const token = 'test-token';
      storeToken(token);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('haunted_greenhouse_token', token);
    });
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      const token = 'test-token';
      localStorageMock.getItem.mockReturnValue(token);
      
      const result = getToken();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('haunted_greenhouse_token');
      expect(result).toBe(token);
    });

    it('should return null when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getToken();
      
      expect(result).toBeNull();
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      removeToken();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('haunted_greenhouse_token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = isAuthenticated();
      
      expect(result).toBe(false);
    });

    it('should return false for invalid token format', () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      
      const result = isAuthenticated();
      
      expect(result).toBe(false);
    });

    it('should return true for valid non-expired token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const payload = { exp: futureTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      
      localStorageMock.getItem.mockReturnValue(token);
      
      const result = isAuthenticated();
      
      expect(result).toBe(true);
    });

    it('should return false for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const payload = { exp: pastTime };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;
      
      localStorageMock.getItem.mockReturnValue(token);
      
      const result = isAuthenticated();
      
      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('haunted_greenhouse_token');
    });
  });
});