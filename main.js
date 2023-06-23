const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  try {
    // Initialize AWS Connect
    const connect = new AWS.Connect();

    // Extract the HTTP method and resource path from the event
    const httpMethod = event.httpMethod;
    const resourcePath = event.path;

    // Extract the customer ID from the path parameters
    const customerId = event.pathParameters.id;

    // Handle different CRUD operations based on the HTTP method and resource path
    if (httpMethod === 'GET' && resourcePath === '/customers/{id}') {
      // Retrieve customer profile by ID
      const customerProfile = await getCustomerProfile(connect, customerId);
      return {
        statusCode: 200,
        body: JSON.stringify(customerProfile)
      };
    } else if (httpMethod === 'POST' && resourcePath === '/customers') {
      // Create a new customer profile
      const requestBody = JSON.parse(event.body);
      const createdCustomerId = await createCustomerProfile(connect, requestBody);
      return {
        statusCode: 201,
        body: JSON.stringify({ id: createdCustomerId })
      };
    } else if (httpMethod === 'PUT' && resourcePath === '/customers/{id}') {
      // Update an existing customer profile
      const requestBody = JSON.parse(event.body);
      await updateCustomerProfile(connect, customerId, requestBody);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Customer profile updated successfully' })
      };
    } else if (httpMethod === 'DELETE' && resourcePath === '/customers/{id}') {
      // Delete an existing customer profile
      await deleteCustomerProfile(connect, customerId);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Customer profile deleted successfully' })
      };
    } else {
      // Handle unsupported routes
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Route not found' })
      };
    }
  } catch (error) {
    // Handle any errors and return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Retrieve customer profile by ID
async function getCustomerProfile(connect, customerId) {
  const params = {
    InstanceId: '<your-connect-instance-id>',
    InitialContactId: customerId
  };
  const result = await connect.getContactAttributes(params).promise();
  return result.Attributes;
}

// Create a new customer profile
async function createCustomerProfile(connect, customerData) {
  const params = {
    InstanceId: '<your-connect-instance-id>',
    InitialContactId: customerData.id,
    Attributes: customerData.attributes
  };
  await connect.updateContactAttributes(params).promise();
  return customerData.id;
}

// Update an existing customer profile
async function updateCustomerProfile(connect, customerId, customerData) {
  const params = {
    InstanceId: '<your-connect-instance-id>',
    InitialContactId: customerId,
    Attributes: customerData.attributes
  };
  await connect.updateContactAttributes(params).promise();
}

// Delete an existing customer profile
async function deleteCustomerProfile(connect, customerId) {
  const params = {
    InstanceId: '<your-connect-instance-id>',
    InitialContactId: customerId,
    Attributes: {}
  };
  await connect.updateContactAttributes(params).promise();
}
