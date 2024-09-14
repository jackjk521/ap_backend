const { StatusCodes } = require("http-status-codes");
const ApiResponse = require("../response/apiResponse");
// const supabase = require("../../functions/supabaseClient");
const prisma = require("../../functions/prismaClient");
// const localDate = require("../../functions/localDate");
// const LogsController = require("../logsManagement");
const _MODULE = "FEEDBACK";

class Feedbacks {
  // GET: /api/items-management/
  static async getItems(req, res) {
    /* 
      QUERY EXPECTED
      1. limit
      2. offset
      3. search
    */

    // Limit is to know the number of entries to returned, offset is used to know how many entries to skip from the start
    const { limit, offset, search, filters, itemType } = req.query;
    try {
      // If limit or offset is undefined, throw error
      if (limit === undefined || offset === undefined) {
        throw new Error(
          JSON.stringify({
            apiCode: true,
            message: "Limit and Offset must be passed",
          })
        );
      }

      // Gets the items data that are not deleted with limit and offset for pagination

      let searchString = search === undefined ? "" : search;
      let searchItemType =
        itemType === undefined || itemType === "undefined" ? "" : itemType;
      let take = parseInt(limit);
      let skip = parseInt(offset) * parseInt(limit);

      // Filter by column and the value to filter
      let filterList = filters === "{}" || filters === undefined ? "" : filters;

      // Defining the where clause depending if there is a filter defined
      let whereClause = { deleted_at: null };

      // Check if filterList is empty or not
      // if (filterList != "") {
      //   // Decode and parse the object passed from the URL
      //   const decodedJson = decodeURIComponent(filterList);
      //   const obj = JSON.parse(decodedJson);
      //   whereClause.AND = [obj];
      // }

      // Search filter
      whereClause.OR = [
        { item_name: { contains: searchString, mode: "insensitive" } },
        // { item_type: { contains: searchString, mode: "insensitive" } },
        { brand: { contains: searchString, mode: "insensitive" } },
      ];

      if (searchItemType !== "") {
        whereClause["item_type"] = searchItemType;
      }

      const data = await prisma.items.findMany({
        where: whereClause,
        select: {
          id: true,
          item_code: true,
          item_name: true,
          item_type: true,
          brand: true,
          description: true,
          status: true,
          remarks: true,
          item_price: true,
          item_category_id: true,
          ItemCategories: {
            select: {
              item_category_name: true,
            },
          },
        },
        skip: skip,
        take: take,
        orderBy: [{ id: "desc" }],
      });

      // console.log(data);
      const countData = await prisma.items.count({ where: whereClause });

      return res.json(
        ApiResponse(
          "Successfully fetched all items data",
          { totalRecords: countData, fetchedData: data },
          StatusCodes.OK
        )
      );
    } catch (error) {
      console.log(error);
      // Parsing error
      // error.message is an error object property
      error = JSON.parse(error.message);
      let message = "Internal Server Error"; // This is a default message
      let data = null; // Default value for data
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR; // Default value for status code

      // Condition to check if issue is from supabase
      // If error.code is truthy or has value, replace error message
      if (error.code) {
        message = "Error in fetching items data";
        data = error.message;
      }

      // Condition to check if issue is from the request itself
      // e.g. No body, No Id and etc.
      if (error.apiCode) {
        message = error.message;
        data = null;
        statusCode = StatusCodes.BAD_REQUEST;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // GET: /api/items-management/:id
  static async getItem(req, res) {
    try {
      /* 
        PARAMETER EXPECTED
        1. id
      */
      const itemId = req.params.id;
      // Gets the specific item data
      const { data, error } = await supabase
        .from("items")
        .select(
          `
        id, item_code, item_name, item_type, brand, item_price, status, description, remarks,
        item_categories (
          item_category_name
        )
      `
        )
        .eq("id", itemId)
        .is("deleted_at", null)
        .single();

      // Checks if there is an error from supabase, if there is it will show the error , if not then it will return the data
      if (error) {
        const { code, message } = error;
        throw new Error(JSON.stringify({ code, message }));
      }
      return res.json(
        ApiResponse("Successfully fetched specific item", data, StatusCodes.OK)
      );
    } catch (error) {
      // Parsing error
      // error.message is an error object property
      error = JSON.parse(error.message);
      let message = "Internal Server Error"; // This is a default message
      let data = null; // Default value for data
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR; // Default value for status code

      // Condition to check if issue is from supabase
      // If error.code is truthy or has value, replace error message
      if (error.code) {
        message = "Error in fetching specific item data";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // POST: /api/feedbacks/
  static async addFeedback(req, res) {
    /* 
        DATA BODY THAT NEEDS TO BE PASSED
        1. estate
        2. block
        3. unit_no
        4. category
        5. subcategory
        6. concern
        7. solution
        8. estimate_duration
        9. call_recording
        10. call_transcription
        11. maintenance_upload
    */

    try {
      // GET DATA FROM BODY
      let body = req.body;

      // CHECK IF BODY IS EMPTY OR NOT
      if (Object.keys(body).length === 0) {
        throw new Error(
          JSON.stringify({ apiCode: true, message: "NO BODY PASSED" })
        );
      }
      console.log(body);

      // GET USER ID FROM CUSTOMER REPRESENTATIVE NAME

      let userData = await prisma.users.findFirst({
        where: {
          username: body.username, // FROM BODY
        },
        select: {
          id: true,
        },
      });

      // GET ESTATE ID FROM ESTATE NAME
      let estateData = await prisma.estates.findFirst({
        where: {
          estate_name: body.estate, // FROM BODY
        },
        select: {
          id: true,
        },
      });
      // GET RESIDENT ENTRY FROM BLOCK , UNIT NO AND ESTATE ID
      let residentData = await prisma.estateResidents.findFirst({
        where: {
          full_name: body.resident, // FROM BODY
        },
        select: {
          id: true,
        },
      });

      // NEW OBJECT TO ADD TO FEEDBACK
      let newObj = {
        user_id: userData.id,
        estate_id: estateData.id,
        resident_id: residentData.id,
        category_name: body.category_name,
        subcategory: body.subcategory,
        concern_description: body.concern_description,
        solution_provided: body.solution_provided,
        estimate_fix_duration: body.estimate_fix_duration,
        call_recording: body.call_recording,
        call_transcription: body.call_transcription,
        maintenance_upload: body.maintenance_upload,
      };

      console.log(newObj);

      // CREATES NEW ENTRY
      let data = await prisma.feedbacks.create({
        data: {
          ...newObj,
        },
      });

      // RESPONSE OBJECT IF SUCCESSFUL
      return res.json(
        ApiResponse("Successfully created feedback entry", data, StatusCodes.OK)
      );
    } catch (error) {
      // Parsing error
      // error.message is an error object property
      error = JSON.parse(error.message);
      let message = "Internal Server Error"; // This is a default message
      let data = null; // Default value for data
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR; // Default value for status code

      // Condition to check if issue is from supabase
      // If error.code is truthy or has value, replace error message
      if (error.code) {
        message = "Error in creating new feedback data";
        data = error.message;
      }

      // Condition to check if issue is from the request itself
      // e.g. No body, No Id and etc.
      if (error.apiCode) {
        message = error.message;
        data = null;
        statusCode = StatusCodes.BAD_REQUEST;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // PUT: /api/items-management/:id
  static async updateItem(req, res) {
    try {
      const logs = new LogsController();
      /* 
          DATA THAT NEEDS TO BE PASSED
          1. item_code
          2. item_name
          4. brand
          5. description
          6. remarks
          7. item_price
          8. status
          
          PARAMETER EXPECTED
          1. id
      */

      const itemId = req.params.id;
      const updatedDate = localDate("UPDATE");

      // Get all details from the form / request body
      let body = req.body;
      const session_uuid = body.session_user_id;
      const session_fullname = body.session_fullname;
      delete body["session_user_id"];
      delete body["session_fullname"];

      // Checks if body passed has value
      if (Object.keys(body).length === 0) {
        throw new Error(
          JSON.stringify({ apiCode: true, message: "No body passed" })
        );
      }
      // Updates exisiting item
      const { data, error } = await supabase
        .from("items")
        .update({ ...body, ...updatedDate })
        .eq("id", itemId)
        .is("deleted_at", null)
        .select();

      // Checks if there is an error from supabase, if there is it will show the error , if not then it will return the inserted data
      if (error) {
        const { code, message } = error;
        throw new Error(JSON.stringify({ code, message }));
      }

      logs.createLog({
        user_id: session_uuid,
        action: "EDIT",
        remarks: `${session_fullname} edited item`,
        module: _MODULE,
      });

      return res.json(
        ApiResponse("Successfully updated item", data, StatusCodes.OK)
      );
    } catch (error) {
      // Parsing error
      // error.message is an error object property
      error = JSON.parse(error.message);
      let message = "Internal Server Error"; // This is a default message
      let data = null; // Default value for data
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR; // Default value for status code

      // Condition to check if issue is from supabase
      // If error.code is truthy or has value, replace error message
      if (error.code) {
        message = "Error in updating item data";
        data = error.message;
      }

      // Condition to check if issue is from the request itself
      // e.g. No body, No Id and etc.
      if (error.apiCode) {
        message = error.message;
        data = null;
        statusCode = StatusCodes.BAD_REQUEST;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // PATCH: /api/items-management/:id
  static async deleteItem(req, res) {
    try {
      const logs = new LogsController();
      /* 
        PARAMETER EXPECTED
        1. id
      */
      const itemId = req.params.id;
      const deletedDate = localDate("DELETE");

      let body = req.body;
      const session_uuid = body.session_user_id;
      const session_fullname = body.session_fullname;
      delete body["session_user_id"];
      delete body["session_fullname"];

      // Updates the deleted_at of the selected item with the  value of current date and time
      const { data, error } = await supabase
        .from("items")
        .update({ ...deletedDate })
        // FIXME: Please check this one
        .eq("id", itemId)
        .is("deleted_at", null)
        .select();

      // Checks if there is an error from supabase, if there is it will show the error , if not then it will return the inserted data
      if (error) {
        const { code, message } = error;
        throw new Error(JSON.stringify({ code, message }));
      }

      logs.createLog({
        user_id: session_uuid,
        action: "DELETE",
        remarks: `${session_fullname} deleted item`,
        module: _MODULE,
      });

      return res.json(
        ApiResponse("Successfully deleted item", data, StatusCodes.OK)
      );
    } catch (error) {
      // Parsing error
      // error.message is an error object property
      error = JSON.parse(error.message);
      let message = "Internal Server Error"; // This is a default message
      let data = null; // Default value for data
      let statusCode = StatusCodes.INTERNAL_SERVER_ERROR; // Default value for status code

      // Condition to check if issue is from supabase
      // If error.code is truthy or has value, replace error message
      if (error.code) {
        message = "Error in deleting specific item data";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }
}

module.exports = Feedbacks;
