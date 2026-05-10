class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return { success: true, statusCode, message, data };
  }

  static error(message = 'An error occurred', statusCode = 500, errors = null) {
    const response = { success: false, statusCode, message };
    if (errors) response.errors = errors;
    return response;
  }

  static paginated(data, pagination, message = 'Fetched successfully') {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination,
    };
  }
}

module.exports = ApiResponse;
