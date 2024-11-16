// sw.js

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
  
    if (url.pathname === '/api/endpoint1') {
      event.respondWith(handleMockRequest(event.request));
    }
  });
  
  async function handleMockRequest(request) {
    // Simulate network delay (e.g., 2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));
  
    // Read the request body if it's a POST, PUT, or PATCH request
    let requestData = null;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      requestData = await request.clone().json().catch(() => null);
    }
  
    // Create a mock response based on the request method
    let mockResponse = null;
    switch (request.method) {
      case 'GET':
        mockResponse = { message: 'Mock GET response' };
        break;
      case 'POST':
        mockResponse = { message: 'Mock POST response', data: requestData };
        break;
      case 'PUT':
        mockResponse = { message: 'Mock PUT response', data: requestData };
        break;
      case 'PATCH':
        mockResponse = { message: 'Mock PATCH response', data: requestData };
        break;
      case 'DELETE':
        mockResponse = { message: 'Mock DELETE response' };
        break;
      default:
        // Return 405 Method Not Allowed for other methods
        return new Response('Method Not Allowed', { status: 405 });
    }
  
    return new Response(JSON.stringify(mockResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  }te