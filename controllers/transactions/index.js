const { StatusCodes } = require("http-status-codes");
const ApiResponse = require("../response/apiResponse");
// const supabase = require("../../functions/supabaseClient");
const prisma = require("../../functions/prismaClient");
// const localDate = require("../../functions/localDate");
// const LogsController = require("../logsManagement");
const _MODULE = "ESTATE";

class Estates {
  // GET: /api/estates/
  static async getEstates(req, res) {
    /* 
      QUERY EXPECTED
      1. limit
      2. offset
      3. search
    */

    // Limit is to know the number of entries to returned, offset is used to know how many entries to skip from the start
    // const { limit, offset, search, filters, itemType } = req.query;
    try {
      //   // If limit or offset is undefined, throw error
      //   if (limit === undefined || offset === undefined) {
      //     throw new Error(
      //       JSON.stringify({
      //         apiCode: true,
      //         message: "Limit and Offset must be passed",
      //       })
      //     );
      //   }

      // Gets the items data that are not deleted with limit and offset for pagination

      // let searchString = search === undefined ? "" : search;
      // let searchItemType =
      //   itemType === undefined || itemType === "undefined" ? "" : itemType;
      // let take = parseInt(limit);
      // let skip = parseInt(offset) * parseInt(limit);

      // Defining the where clause depending if there is a filter defined
      let whereClause = { id: { not: -1 } };

      // Search filter
      // whereClause.OR = [
      //   { item_name: { contains: searchString, mode: "insensitive" } },
      //   // { item_type: { contains: searchString, mode: "insensitive" } },
      //   { brand: { contains: searchString, mode: "insensitive" } },
      // ];

      const data = await prisma.estates.findMany({
        where: whereClause,
        select: {
          id: true,
          estate_name:true, 
          country_origin: true,
          total_units: true,
          property_type: true,
        },
        // skip: skip,
        // take: take,
        orderBy: [{ created_at: "desc" }],
      });

      // console.log(data);
      const countData = await prisma.estates
        .count
        // { where: whereClause }
        ();

      return res.json(
        ApiResponse(
          "Successfully fetched all estate data",
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

  // GET: /api/estates/:id
  static async getEstate(req, res) {
    try {
      /* 
        PARAMETER EXPECTED
        1. id
      */
      const estateId = parseInt(req.params.id);

      let whereClause = { id: estateId };

      // Gets the specific data
      const data = await prisma.estates.findFirst({
        where: whereClause,
        select: {
          id: true,
          estate_name:true, 
          country_origin: true,
          total_units: true,
          property_type: true,
        },
      });

      return res.json(
        ApiResponse("Successfully fetched specific estate", data, StatusCodes.OK)
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
        message = "Error in fetching specific estate data";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // POST: /api/estates/  (TO UPDATE)
  static async addEstate(req, res) {
    /* 
        DATA BODY THAT NEEDS TO BE PASSED
        1. resident
        2. estate
        3. block
        3. unit_no
        5. category
        6. subcategory
        7. concern
        8. solution
        9. estimate_duration
        10. call_recording
        11. call_transcription
        12. maintenance_upload
        13: username
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
          full_name: body.resident,
          estate_id: estateData.id,
          block: body.block,
          unit_no: body.unit_no,
        },
        select: {
          id: true,
        },
      });

      // NEW OBJECT TO ADD TO estate
      let newObj = {
        user_id: userData.id,
        estate_id: estateData.id,
        resident_id: residentData.id,
        category_name: body.category_name,
        subcategory: body.subcategory,
        concern_description: body.concern_description,
        solution_provided: body.solution_provided,
        solution_updates: 'PENDING',
        estimate_fix_duration: body.estimate_fix_duration,
        call_recording: body.call_recording,
        call_transcription: body.call_transcription,
        maintenance_upload: body.maintenance_upload,
      };

      console.log(newObj);

      // CREATES NEW ENTRY
      let data = [];
      try {
        data = await prisma.estates.create({
          data: {
            ...newObj
          },
        });
        console.log(data);
      } catch (error) {
        console.error("Error creating estate:", error);
      }

      // RESPONSE OBJECT IF SUCCESSFUL
      return res.json(
        ApiResponse("Successfully created estate entry", data, StatusCodes.OK)
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
        message = "Error in creating new estate data";
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

  // PUT: /api/estates/ (TO UPDATE)
  static async updateEstate(req, res) {
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
          estate_id: estateData.id,
          block: body.block,
          unit_no: body.unit_no,
        },
        select: {
          id: true,
        },
      });

      // GET estate ID FROM DATA FROM SHEET ROW
      let feedbackData = await prisma.estates.findFirst({
        where: {
          estate_id: estateData.id,
          resident_id: residentData.id,
          call_recording: body.call_recording, // UNIQUE per call
        },
        select: {
          id: true,
        },
      });

      // UPDATED OBJECT TO ADD TO estate
      let updatedObj = {
        // user_id: userData.id,
        // estate_id: estateData.id,
        // resident_id: residentData.id,
        category_name: body.category_name,
        subcategory: body.subcategory,
        // concern_description: body.concern_description,
        // solution_provided: body.solution_provided,
        solution_updates: body.solution_updates,
        estimate_fix_duration: body.estimate_fix_duration,
        // call_recording: body.call_recording,
        // call_transcription: body.call_transcription,
        // maintenance_upload: body.maintenance_upload,
      };

      console.log(updatedObj);

      // CREATES NEW ENTRY
      let data = await prisma.estates.update({
        where: {
          id: feedbackData.id,
        },
        data: {
          ...updatedObj,
        },
      });

      // RESPONSE OBJECT IF SUCCESSFUL
      return res.json(
        ApiResponse("Successfully updated estate entry", data, StatusCodes.OK)
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
        message = "Error in creating new estate data";
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

  // PATCH: /api/estates/:id (TO UPDATE)
  static async deleteEstate(req, res) {
    try {
      // const logs = new LogsController();
      /* 
        PARAMETER EXPECTED
        1. id
      */
      const estateId = parseInt(req.params.id);
      // const deletedDate = localDate("DELETE");

      // let body = req.body;
      // const session_uuid = body.session_user_id;
      // const session_fullname = body.session_fullname;
      // delete body["session_user_id"];
      // delete body["session_fullname"];

      // Delete instance
      const data = await prisma.estates.update({
        where: {
          id: estateId,
        },
        data: {
          updated_at: new Date(),
        }
      });

      // logs.createLog({
      //   user_id: session_uuid,
      //   action: "DELETE",
      //   remarks: `${session_fullname} deleted item`,
      //   module: _MODULE,
      // });

      return res.json(
        ApiResponse("Successfully deleted estate", data, StatusCodes.OK)
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
        message = "Error in deleting specific estate data";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }
}

module.exports = Estates;
