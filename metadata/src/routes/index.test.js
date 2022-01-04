describe('API routes', () => {
    const mockLogger = {
        logError: jest.fn()
    };
    jest.doMock('../services/log', () => {
        return mockLogger;
    });

    const mockListenFn = jest.fn((port, callback) => callback());
    const mockGetFn = jest.fn();
    const mockPutFn = jest.fn();
    const mockApp = {
        listen: mockListenFn,
        get: mockGetFn,
        put: mockPutFn,
    };

    const mockDb = {
        collection: jest.fn(() => { return {}; })
    };

    const mockMicroservice = {
        app: mockApp,
        db: mockDb
    };

    const routes = require('./index');

    test('routes added to app', () => {
        routes.setupHandlers(mockMicroservice);

        expect(mockGetFn.mock.calls.length).toEqual(2); // two routes
        expect(mockGetFn.mock.calls.some((call) => { return call[0] === '/'; })).toBeTruthy();  // one is root
        expect(mockGetFn.mock.calls.some((call) => { return call[0] === '/video'; })).toBeTruthy(); // another is /video

        expect(mockPutFn.mock.calls.length).toEqual(1); // two routes
        expect(mockPutFn.mock.calls[0][0]).toEqual('/video');
    });

    
});