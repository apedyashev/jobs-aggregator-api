module.exports = {
  meta(newPaginateProps) {
    const paginate = {
      currentPage: 1,
      nextPage: null,
      prevPage: null,
      totalPages: 1,
      totalCount: 0,
      perPage: 50,
    };
    return {
      paginate: Object.assign({}, paginate, newPaginateProps),
    };
  },
};
