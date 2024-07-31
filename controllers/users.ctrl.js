const dbPool = require("../configuration/db/dbPool.conf.js");
const { ApiResponse } = require("../configuration/utils/ApiResponse.conf.js");

const { flag, statusCode, status } = require("../configuration/utils/Constant.conf.js");

const { masterData, select, getcount, deleteString, insert, update } = require("../models/users.model.js");

const fun_SelectById = (req, res) => {
  try {
    const userId = req.body.userId || 0;

    let strQuery = select(` and "userId" = $1 `);
    dbPool.query(strQuery, [userId], (err, result, fields) => {
      if (err) {
        return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
      }
      if (result.length == 0) {
        return res.json(new ApiResponse(flag.fail, status.noData, statusCode.noData, []));
      } else {
        return res.json(new ApiResponse(flag.success, status.success, statusCode.success, result));
      }
    });
  } catch (err) {
    return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
  }
};

const fun_SelectAll = async (req, res) => {
  try {
    let strWhere = "";
    let strLimit = "";

    let dataPera = [];

    let pageIndex = req.body.pageIndex || "";
    let pageSize = req.body.pageSize || "";

    if (pageSize != "all") strLimit = " limit " + (pageIndex - 1) * pageSize + "," + pageSize;

    strWhere += ` order by userId desc `;

    let strQuery = select(strWhere + strLimit);
    let strCount = getcount(strWhere);

    let [strQueryResult] = await dbPool.promise().query(strQuery, dataPera);
    let [strCountResult] = await dbPool.promise().query(strCount, dataPera);

    if (strCountResult.count == 0) {
      return res.json(new ApiResponse(flag.fail, status.noData, statusCode.noData, []));
    } else {
      return res.json(
        new ApiResponse(flag.success, status.success, statusCode.success, {
          records: strQueryResult,
          totalRecords: strCountResult,
        })
      );
    }
  } catch (err) {
    return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
  }
};

const fun_DeleteById = async (req, res) => {
  try {
    const userId = req.body.userId || 0;

    let strQuery = deleteString(` and userId = ${userId} `);
    dbPool.query(strQuery, (err, result, fields) => {
      if (err) {
        return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
      }
      if (result.affectedRows == 0) {
        return res.json(new ApiResponse(flag.fail, status.noData, statusCode.noData, []));
      } else {
        return res.json(new ApiResponse(flag.success, status.success, statusCode.delete, result));
      }
    });
  } catch (err) {
    return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
  }
};

const fun_Insert = async (req, res) => {
  try {
    const verb = masterData(req);
    const strQuery = insert(verb);
    //# Check validation
    const strCount = getcount(` and userId != 0 and emailId = ? `);
    const [strCountResult] = await dbPool.promise().query(strCount, [verb.emailId]);

    const countDepartment = strCountResult[0].cnt;
    if (countDepartment > 0) {
      return res.json(new ApiResponse(flag.fail, status.existData, statusCode.existData, []));
    }

    dbPool.query(strQuery.query, strQuery.data, (err, result, fields) => {
      if (err) {
        return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
      } else {
        return res.json(new ApiResponse(flag.success, status.success, statusCode.insert, result));
      }
    });
  } catch (err) {
    return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
  }
};

const fun_Update = async (req, res) => {
  try {
    const verb = masterData(req);
    const strQuery = update(verb);
    //# Check validation
    const strCount = getcount(` and userId != ? and emailId = ? `);
    const [strCountResult] = await dbPool.promise().query(strCount, [verb.userId, verb.emailId]);

    const countDepartment = strCountResult[0].cnt;
    if (countDepartment > 0) {
      return res.json(new ApiResponse(flag.fail, status.existData, statusCode.existData, []));
    }

    dbPool.query(strQuery.query, strQuery.data, (err, result, fields) => {
      if (err) {
        return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
      }
      if (result.affectedRows == 0) {
        return res.json(new ApiResponse(flag.fail, status.noData, statusCode.noData, []));
      } else {
        return res.json(new ApiResponse(flag.success, status.success, statusCode.update, result));
      }
    });
  } catch (err) {
    return res.json(new ApiResponse(flag.fail, status.systemError, err, { originalUrl: req.originalUrl }));
  }
};

module.exports = { fun_SelectById, fun_SelectAll, fun_DeleteById, fun_Insert, fun_Update };
