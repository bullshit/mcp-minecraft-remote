import { z } from "zod";
import { botState, server } from "../server.js";
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from "../utils/error-handler.js";

// Function to register inventory-related tools
export function registerInventoryTools() {
  // Tool to check inventory
  server.tool(
    "checkInventory",
    "Check the items in the player inventory",
    {},
    async () => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }

      try {
        const items = botState.bot.inventory.items();
        if (items.length === 0) {
          return createSuccessResponse("Inventory is empty.");
        }

        const itemList = items
          .map((item) => `${item.name} x${item.count}`)
          .join(", ");

        return createSuccessResponse(`Inventory contains: ${itemList}`);
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // Tool to find a specific item
  server.tool(
    "findItem",
    "Find a specific item in the bot's inventory",
    {
      nameOrType: z.string().describe("Name or type of item to find"),
    },
    async ({ nameOrType }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }
      try {
        const items = botState.bot.inventory.items();
        const item = items.find((item: any) =>
          item.name.includes(nameOrType.toLowerCase())
        );

        if (item) {
          return createSuccessResponse(
            `Found ${item.count} ${item.name} in inventory (slot ${item.slot})`
          );
        } else {
          return createSuccessResponse(
            `Couldn't find any item matching '${nameOrType}' in inventory`
          );
        }
      } catch (error) {
        return createErrorResponse(error as Error);
      }
    }
  );
}
