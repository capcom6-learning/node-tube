const axios = require("axios");
const mongodb = require("mongodb");

false && describe("metadata microservice integration", () => {
    
    afterEach(() => {
        jest.resetModules();
    });

    const BASE_URL = "http://localhost:3000"; // Base URL for our HTTP server.
    const DBHOST = "mongodb://localhost:27015"; // Have the database running on this computer.
    const DBNAME = "testdb";

    //
    // Import the module we are testing.
    //

    const { startMicroservice } = require("./index"); 

    //
    // Setup the HTTP server.
    //

    let microservice; // Saves a reference to the our microservice object.

    beforeAll(async () => {
        microservice = await startMicroservice({
            port: 3000,
            dbHost: DBHOST,
            dbName: DBNAME,
        }); // Start server before all tests.
    });

    afterAll(async () => {
        await microservice.close();  // Close server after all tests.
    });

    //
    // Wrapper function for doing a HTTP GET request so that we don't have to repeat the base URL 
    // across multiple tests.
    //
    function httpGet(route) {
        const url = `${BASE_URL}${route}`;
        console.log(`Requesting ${url}`);
        return axios.get(url);
    }

    // 
    // Helper function to load a database fixture into our database.
    //
    async function loadDatabaseFixture(collectionName, records) {
        // console.log(microservice);
        await microservice.db.dropDatabase(); // Reset the test database.

        const collection = microservice.db.collection(collectionName);
        await collection.insertMany(records); // Insert the database fixture.
    }
    
    //
    // Tests go here.
    //
    
    test("/videos route retrieves data via videos collection", async () => {

        const id1 = new mongodb.ObjectId();
        const id2 = new mongodb.ObjectId();
        const videoPath1 = "my-video-1.mp4";
        const videoPath2 = "my-video-2.mp4";

        const testVideos = [
            {
                _id: id1,
                videoPath: videoPath1
            },
            {
                _id: id2,
                videoPath: videoPath2
            },
        ];

        // Load database fixture into the database.
        await loadDatabaseFixture("videos", testVideos);
        
        const response = await httpGet("/videos");  // Make a request to the videos route.
        expect(response.status).toEqual(200);       // Expect HTTP status code 200 (ok).

        const videos = response.data.videos;        // Check the videos retrieved are the ones we put in the database.
        expect(videos.length).toEqual(2);
        expect(videos[0]._id).toEqual(id1.toString());
        expect(videos[0].videoPath).toEqual(videoPath1);
        expect(videos[1]._id).toEqual(id2.toString());
        expect(videos[1].videoPath).toEqual(videoPath2);
    });

});

describe('metadata microservice units', () => {
    //
    // Setup mocks.
    //

    const mockConfig = {
        port: 3000
    };

    const mockListenFn = jest.fn((port, callback) => callback());
    const mockGetFn = jest.fn();
    const mockPutFn = jest.fn();
    const mockUseFn = jest.fn();

    jest.doMock("express", () => { // Mock the Express module.
        return () => { // The Express module is a factory function that creates an Express app object.
            return { // Mock Express app object.
                listen: mockListenFn,
                get: mockGetFn,
                put: mockPutFn,
                use: mockUseFn,
            };
        };
    });

    const mockVideosCollection = { // Mock Mongodb collection.
    };

    const mockDb = { // Mock Mongodb database.
        collection: () => {
            return mockVideosCollection;
        }
    };

    const mockMongoClient = { // Mock Mongodb client object.
        db: () => {
            return mockDb;
        }
    };

    jest.doMock("mongodb", () => { // Mock the Mongodb module.
        return { // Mock Mongodb module.
            MongoClient: { // Mock MongoClient.
                connect: async () => { // Mock connect function.
                    return mockMongoClient;
                }
            },
            ObjectId: jest.fn().mockImplementation((id) => {
                return {id};
            })
        };
    });

    //
    // Import the module we are testing.
    //

    const { startMicroservice } = require("./index");

    //
    // Tests go here.
    //
    
    test("microservice starts web server on startup", async () => {
        
        await startMicroservice(mockConfig);

        expect(mockListenFn.mock.calls.length).toEqual(1);     // Check only 1 call to 'listen'.
        expect(mockListenFn.mock.calls[0][0]).toEqual(3000);   // Check for port 3000.
    });

    test("/videos route is handled", async () => {
        
        await startMicroservice(mockConfig);

        expect(mockGetFn).toHaveBeenCalled();

        expect(mockGetFn.mock.calls.some((call) => { return call[0] === '/video' })).toBeTruthy();
    });

    test("/video route retreives data via videos collection", async () => {

        await startMicroservice(mockConfig);

        const mockRequest = {
            query: {}
        };
        const mockJsonFn = jest.fn();
        const mockResponse = {
            json: mockJsonFn
        };

        const mockRecord1 = {};
        const mockRecord2 = {};

        // Mock the find function to return some mock records.
        mockVideosCollection.find = () => {
            return {
                toArray: async () => { // This is set up to follow the convention of the Mongodb library.
                    return [ mockRecord1, mockRecord2 ];
                }
            };
        };

        const videosRouteHandler = mockGetFn.mock.calls.find((call) => { return call[0] === '/video' })[1]; // Extract the /videos route handler function.
        await videosRouteHandler(mockRequest, mockResponse); // Invoke the request handler.

        expect(mockJsonFn.mock.calls.length).toEqual(1); // Expect that the json fn was called.
        expect(mockJsonFn.mock.calls[0][0]).toEqual({
            videos: [ mockRecord1, mockRecord2 ], // Expect that the mock records were retrieved via the mock database function.
        });
    });

    test("/video route retreives data by id", async () => {

        await startMicroservice(mockConfig);

        const mockRequest = {
            query: {
                id: '61a704c1aa87dfcd0e392a42'
            }
        };
        const mockJsonFn = jest.fn();
        const mockResponse = {
            json: mockJsonFn
        };

        const mockRecord = {};

        // Mock the find function to return some mock records.
        mockVideosCollection.findOne = async (query) => {
            return mockRecord;
        };

        const videosRouteHandler = mockGetFn.mock.calls.find((call) => { return call[0] === '/video' })[1]; // Extract the /videos route handler function.
        await videosRouteHandler(mockRequest, mockResponse); // Invoke the request handler.

        expect(mockJsonFn.mock.calls.length).toEqual(1); // Expect that the json fn was called.
        expect(mockJsonFn.mock.calls[0][0]).toEqual(mockRecord);
    });
});
