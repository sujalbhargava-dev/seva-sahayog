export class ApiResponse<T = any> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data: T | null;
  public meta?: Record<string, any>;

  constructor(
    statusCode: number,
    message: string,
    data: T | null = null,
    meta?: Record<string, any>
  ) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
  }

  static ok<T>(data: T, message = 'Success', meta?: Record<string, any>) {
    return new ApiResponse(200, message, data, meta);
  }

  static created<T>(data: T, message = 'Created successfully') {
    return new ApiResponse(201, message, data);
  }

  static noContent(message = 'Deleted successfully') {
    return new ApiResponse(204, message);
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success'
  ) {
    return new ApiResponse(200, message, data, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  }
}
