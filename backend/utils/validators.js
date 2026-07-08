const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

const isValidDate = (date) => {
  return !Number.isNaN(new Date(date).getTime());
};

const isValidBoolean = (value) => {
  return typeof value === "boolean";
};

const normalizePagination = (query) => {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
};

module.exports = {
  isValidEmail,
  isValidDate,
  isValidBoolean,
  normalizePagination,
};