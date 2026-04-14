export class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  pagination() {
    const PAGE_LIMIT = 3;
    let PAGE_NUMBER = this.queryString.page * 1 || 1;

    if (this.queryString.page <= 0) {
      PAGE_NUMBER = 1;
      const PAGE_SKIP = (PAGE_NUMBER - 1) * PAGE_LIMIT; // 2 * 3

      this.mongooseQuery.skip(PAGE_SKIP).limit(PAGE_LIMIT);
      return this;
    }
  }

  filteration() {
    let filterObj = { ...this.queryString };

    let excludeQuery = ['page', 'sort', 'fields', 'keywords'];

    excludeQuery.forEach((ele) => {
      delete filterObj[ele];
    });

    filterObj = JSON.stringify(filterObj);

    filterObj = filterObj.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`,
    );

    filterObj = JSON.parse(filterObj);

    this.mongooseQuery.find(filterObj);
    return this;
  }
}
