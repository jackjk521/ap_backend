const { StatusCodes } = require("http-status-codes");
const ApiResponse = require("../response/apiResponse");
// const supabase = require("../../functions/supabaseClient");
const prisma = require("../../functions/prismaClient");
// const localDate = require("../../functions/localDate");
// const LogsController = require("../logsManagement");
const _MODULE = "FEEDBACK";

class Feedbacks {
  // GET: /api/feedbacks/
  static async getFeedbacks(req, res) {
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

      const data = await prisma.feedbacks.findMany({
        where: whereClause,
        select: {
          id: true,
          Users: {
            select: {
              id: true,
              username: true,
            },
          },
          EstateResidents: {
            select: {
              id: true,
              full_name: true,
            },
          },
          Estates: {
            select: {
              estate_name: true,
            },
          },
          category_name: true,
          subcategory: true,
          concern_description: true,
          solution_provided: true,
          solution_updates: true,
          estimate_fix_duration: true,
          call_recording: true,
          call_transcription: true,
          maintenance_upload: true,
          created_at: true,
        },
        // skip: skip,
        // take: take,
        orderBy: [{ created_at: "desc" }],
      });

      // console.log(data);
      const countData = await prisma.feedbacks
        .count
        // { where: whereClause }
        ();

      return res.json(
        ApiResponse(
          "Successfully fetched all feedback data",
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

  // GET: /api/feedbacks/:id
  static async getFeedback(req, res) {
    try {
      /* 
        PARAMETER EXPECTED
        1. id
      */
      const feedbackId = parseInt(req.params.id);

      let whereClause = { id: feedbackId };

      // Gets the specific data
      const data = await prisma.feedbacks.findFirst({
        where: whereClause,
        select: {
          id: true,
          Users: {
            select: {
              id: true,
              username: true,
            },
          },
          EstateResidents: {
            select: {
              id: true,
              full_name: true,
            },
          },
          Estates: {
            select: {
              estate_name: true,
            },
          },
          category_name: true,
          subcategory: true,
          concern_description: true,
          solution_provided: true,
          solution_updates: true,
          estimate_fix_duration: true,
          call_recording: true,
          call_transcription: true,
          maintenance_upload: true,
          created_at: true,
        },
      });

      return res.json(
        ApiResponse("Successfully fetched specific feedback", data, StatusCodes.OK)
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
        message = "Error in fetching specific feedback data";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // POST: /api/feedbacks/
  static async addFeedback(req, res) {
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

      // NEW OBJECT TO ADD TO FEEDBACK
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
        data = await prisma.feedbacks.create({
          data: {
            ...newObj
          },
        });
        console.log(data);
      } catch (error) {
        console.error("Error creating feedback:", error);
      }

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

  // PUT: /api/feedbacks/
  static async updateFeedback(req, res) {
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

      // GET FEEDBACK ID FROM DATA FROM SHEET ROW
      let feedbackData = await prisma.feedbacks.findFirst({
        where: {
          estate_id: estateData.id,
          resident_id: residentData.id,
          call_recording: body.call_recording, // UNIQUE per call
        },
        select: {
          id: true,
        },
      });

      // UPDATED OBJECT TO ADD TO FEEDBACK
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
      let data = await prisma.feedbacks.update({
        where: {
          id: feedbackData.id,
        },
        data: {
          ...updatedObj,
        },
      });

      // RESPONSE OBJECT IF SUCCESSFUL
      return res.json(
        ApiResponse("Successfully updated feedback entry", data, StatusCodes.OK)
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

  // PATCH: /api/feedbacks/:id
  static async deleteFeedback(req, res) {
    try {
      // const logs = new LogsController();
      /* 
        PARAMETER EXPECTED
        1. id
      */
      const feedbackId = parseInt(req.params.id);
      // const deletedDate = localDate("DELETE");

      // let body = req.body;
      // const session_uuid = body.session_user_id;
      // const session_fullname = body.session_fullname;
      // delete body["session_user_id"];
      // delete body["session_fullname"];

      // Delete instance
      const data = await prisma.feedbacks.update({
        where: {
          id: feedbackId,
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
        ApiResponse("Successfully deleted feedback", data, StatusCodes.OK)
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
        message = "Error in deleting specific feedback data";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }
}

module.exports = Feedbacks;
