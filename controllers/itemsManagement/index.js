const { StatusCodes } = require("http-status-codes");
const ApiResponse = require("../response/apiResponse");
// const supabase = require("../../functions/supabaseClient");
// const prisma = require("../../functions/prismaClient");
// const localDate = require("../../functions/localDate");
// const LogsController = require("../logsManagement");
const _MODULE = "ITEM";
class ItemsManagement {
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

  // GET: /api/items-management/inventory/:id?type=
  static async getItemsByInventory(req, res) {
    try {
      /* 
          PARAMETER EXPECTED
          1. id
        */

      /*
        DATA NEEDED IN QUERY
        1. type
        */

      const branchId = parseInt(req.params.id);
      const { type } = req.query;
      let itemType = type === undefined ? "" : type;
      // console.log(itemType);
      const whereCondition = {
        branch_id: branchId,
        ...(itemType != "" && {
          Items: {
            is: {
              item_type: itemType,
            },
          },
        }),
      };

      const data = await prisma.inventory.findMany({
        where: whereCondition,
        select: {
          id: true,
          Items: {
            select: {
              id: true,
              item_code: true,
              item_name: true,
            },
          },
          available_quantity: true,
          total_quantity: true,
          floating_quantity: true,
        },
      });
      // console.log(data);

      const aliasedData = data.map((item) => ({
        label:
          item.Items["item_code"] + " " + item.Items["item_name"] + " - " + "Stock: " + item.available_quantity,
        value: item.Items["id"].toString(),
        item_name: item.Items["item_name"],
        available_quantity: item.available_quantity,
      }));

      return res.json(
        ApiResponse(
          "Successfully fetched items from specific branch inventory",
          { aliasedData: aliasedData, fetchedData: data },
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
        message = "Error in fetching items from specific branch inventory";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // GET: /api/items-management/check-availability/:id
  static async checkItemAvailability(req, res) {
    try {
      /* 
      QUERY EXPECTED
        1. selectedItems
        2. quantity
      */
      /* 
        PARAMETER EXPECTED
        1. id
      */

      const branchId = req.params.id;
      let body = req.body;

      let addedItems = [];
      let failedItems = [];

      let addedItemsString = "";
      let failedItemsString = "";

      // Loop through all selectedItems to compare the quantity with their available quantity
      // IF it passes the condition, then add item id to the array and add the item name to the string
      // ELSE , add the item ids to the failed array and add the item name to the failed string

      // ARRAY OF ITEMS TO CHECK
      let selectedItems = body.selectedItems;
      let reqQuantity = body.quantity;

      // console.log(selectedItems);

      await Promise.all(
        selectedItems.map(async (id) => {
          // Perform the Prisma query to get the inventory item
          const inventoryItem = await prisma.inventory.findFirst({
            where: {
              item_id: parseInt(id), // Assuming item has an id property
              branch_id: parseInt(branchId),
            },
            select: {
              available_quantity: true,
              Items: {
                select: {
                  item_name: true,
                },
              },
            },
          });

          // Check if the requested quantity is less than or equal to the available stock
          if (reqQuantity <= inventoryItem.available_quantity) {
            // If True, add to the addedItems
            addedItems.push(id);
            addedItemsString += inventoryItem.Items["item_name"] + ",";
          } else {
            // If False, add to the failedAdded array
            failedItems.push(id);
            failedItemsString += inventoryItem.Items["item_name"] + ", ";
            return null;
          }
        })
      );

      // console.log(data);

      // const aliasedData = data.map((item) => ({
      //   label:
      //     item.Items["item_name"] + " - " + "Stock: " + item.available_quantity,
      //   value: item.Items["id"].toString(),
      //   available_quantity: item.available_quantity,
      // }));

      return res.json(
        ApiResponse(
          "Successfully checked availability for all selected items",
          {
            addedItems: addedItems,
            addedItemsString: addedItemsString,
            failedItems: failedItems,
            failedItemsString: failedItemsString,
          },
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
        message = "Error in checking availability of selected items";
        data = error.message;
      }

      return res.json(ApiResponse(message, data, statusCode, true));
    }
  }

  // GET: /api/items-management/list
  static async getListItems(req, res) {
    try {
      const data = await prisma.items.findMany();

      data.map((el) => {
        el["item_code_name"] = `[${el.item_code}] ${el.item_name}`;
        return el;
      });

      return res.json(
        ApiResponse(
          "Successfully fetched all items list data",
          data,
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

  // POST: /api/items-management/
  static async addItem(req, res) {
    /* 
        DATA THAT NEEDS TO BE PASSED
        1. item_code
        2. item_name
        3. item_type
        4. brand
        5. description
        6. remarks
        7. item_price
        8. status
        9. item_category_id
    */

    try {
      const logs = new LogsController();
      // Get all details from the form / request body
      let body = req.body;
      const session_uuid = body.session_user_id;
      const session_fullname = body.session_fullname;
      delete body["session_user_id"];
      delete body["session_fullname"];
      const createdDate = localDate("CREATE");
      const updatedDate = localDate("UPDATE");

      // Checks if body passed has value
      if (Object.keys(body).length === 0) {
        throw new Error(
          JSON.stringify({ apiCode: true, message: "No body passed" })
        );
      }
      // console.log(body)

      // ADD CHECKING IF ITEM ALREADY EXISTS
      const itemCheck = await prisma.items.findMany({
        where: {
          item_name: body.item_name
        }
      })
    if(itemCheck.length > 0 ){
          // IF EXISTs: THROW ERROR
          throw new Error(
          JSON.stringify({
            apiCode: true,
            message: "Item already exists",
          })
        );
      }
    
      // Creates a new item
      const { data, error } = await supabase
        .from("items")
        .insert({ ...body, ...createdDate, ...updatedDate })
        .select();

      // Checks if there is an error from supabase, if there is it will show the error , if not then it will return the inserted data
      if (error) {
        const { code, message } = error;
        throw new Error(JSON.stringify({ code, message }));
      }

      logs.createLog({
        user_id: session_uuid,
        action: "CREATE",
        remarks: `${session_fullname} created new item`,
        module: _MODULE,
      });

      return res.json(
        ApiResponse("Successfully created item", data, StatusCodes.OK)
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
      // FIXME: "Error in creating new item data."
      if (error.code) {
        message = "Error in creating new item data";
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
  // GET: /api/items-management/item-categories
  static async getItemCategories(req, res) {
    try {
      // Defining the where clause
      let whereClause = { deleted_at: null };

      const data = await prisma.itemCategories.findMany({
        where: whereClause,
        select: {
          id: true,
          item_category_name: true,
        },
      });

      return res.json(
        ApiResponse(
          "Successfully fetched all item categories",
          data,
          StatusCodes.OK
        )
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
        message = "Error in fetching item categories";
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
}

module.exports = ItemsManagement;
