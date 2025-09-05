export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class PaginationUtil {
  static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static getTake(limit: number): number {
    return Math.min(limit, 100); // Max 100 items per page
  }

  static getOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc') {
    if (!sortBy) return undefined;
    
    return {
      [sortBy]: sortOrder || 'desc',
    };
  }

  static validatePagination(options: PaginationOptions): {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  } {
    return {
      page: Math.max(1, options.page || 1),
      limit: Math.min(100, Math.max(1, options.limit || 20)),
      sortBy: options.sortBy,
      sortOrder: options.sortOrder || 'desc',
    };
  }
}