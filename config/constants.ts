const { MONGOURL, JWT_SERCTET, JWT_EXPIRE_IN } = process.env;
export = {
  mongourl: MONGOURL || '',
  jwt_secrit: JWT_SERCTET || '',
  jwt_expire_in: JWT_EXPIRE_IN || '',
};
