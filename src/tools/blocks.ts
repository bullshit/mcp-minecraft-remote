import minecraftData from "minecraft-data";
import pathfinderPkg from "mineflayer-pathfinder";
import { Vec3 } from "vec3";
import { z } from "zod";
import { botState, server } from "../server.js";
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from "../utils/error-handler.js";
const { goals } = pathfinderPkg;

// Function to register block operation tools
export function registerBlockTools() {
  // Tool for digging blocks
  server.tool(
    "digBlock",
    "Dig a block at the specified coordinates",
    {
      x: z.number().describe("X coordinate"),
      y: z.number().describe("Y coordinate"),
      z: z.number().describe("Z coordinate"),
    },
    async ({ x, y, z }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }

      try {
        const bot = botState.bot!;
        const block = bot.blockAt(new Vec3(x, y, z));

        if (!block || block.name === "air") {
          return createSuccessResponse(
            "No block found at the specified coordinates."
          );
        }

        if (!bot.canDigBlock(block) || !bot.canSeeBlock(block)) {
          const goal = new goals.GoalNear(x, y, z, 2);
          await bot.pathfinder.goto(goal);
        }

        await bot.dig(block);

        return createSuccessResponse(
          `Successfully dug ${block.name} at X=${x}, Y=${y}, Z=${z}`
        );
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // Tool for placing blocks
  server.tool(
    "placeBlock",
    "Place a block at the specified location",
    {
      x: z.number().describe("X coordinate"),
      y: z.number().describe("Y coordinate"),
      z: z.number().describe("Z coordinate"),
      itemName: z.string().describe("Name of the item to place"),
    },
    async ({ x, y, z, itemName }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }

      try {
        // Find item from inventory
        const item = botState.bot.inventory
          .items()
          .find((item) => item.name.toLowerCase() === itemName.toLowerCase());

        if (!item) {
          return createSuccessResponse(
            `Item "${itemName}" not found in inventory.`
          );
        }

        // Hold item in hand
        await botState.bot.equip(item, "hand");

        // Get reference block and placement face for target position
        const targetPos = { x, y, z };
        const faceVectors = [
          { x: 0, y: 1, z: 0 }, // Up
          { x: 0, y: -1, z: 0 }, // Down
          { x: 1, y: 0, z: 0 }, // East
          { x: -1, y: 0, z: 0 }, // West
          { x: 0, y: 0, z: 1 }, // South
          { x: 0, y: 0, z: -1 }, // North
        ];

        // Check each face to see if placement is possible
        for (const faceVector of faceVectors) {
          const referencePos = {
            x: targetPos.x - faceVector.x,
            y: targetPos.y - faceVector.y,
            z: targetPos.z - faceVector.z,
          };

          const referenceBlock = botState.bot.blockAt(
            new Vec3(referencePos.x, referencePos.y, referencePos.z)
          );

          if (referenceBlock && referenceBlock.name !== "air") {
            try {
              // Place the block
              await botState.bot.placeBlock(
                referenceBlock,
                new Vec3(faceVector.x, faceVector.y, faceVector.z)
              );

              return createSuccessResponse(
                `Successfully placed ${itemName} at X=${x}, Y=${y}, Z=${z}`
              );
            } catch (err) {
              // If placement fails on this face, try the next face
              continue;
            }
          }
        }

        // If placement fails on all faces
        return createSuccessResponse(
          `Failed to place ${itemName}. No suitable surface found or not enough space.`
        );
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // Tool for getting block information
  server.tool(
    "getBlockInfo",
    "Get information about a block at the specified position",
    {
      x: z.number().describe("X coordinate"),
      y: z.number().describe("Y coordinate"),
      z: z.number().describe("Z coordinate"),
    },
    async ({ x, y, z }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }

      try {
        const blockPos = new Vec3(x, y, z);
        const block = botState.bot.blockAt(blockPos);

        if (!block) {
          return createSuccessResponse(
            `No block information found at position (${x}, ${y}, ${z}`
          );
        }
        return createSuccessResponse(
          `Found ${block.name} (type: ${block.type} ) at position (${block.position.x}, ${block.position.y}, ${block.position.z})`
        );
      } catch (error) {
        return createErrorResponse(error as Error);
      }
    }
  );

  // Tool for finding the nearest block of a specific type
  server.tool(
    "findBlock",
    "Find the nearest block of a specific type as minecraftData.blocksByName",
    {
      blockType: z
        .string()
        .describe("Type of block to find as minecraftData.blocksByName"),
      maxDistance: z
        .number()
        .optional()
        .describe("Maximum search distance (default: 16)"),
    },
    async ({ blockType, maxDistance = 16 }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }
      try {
        const mcData = minecraftData(botState.bot.version);
        const blocksByName = mcData.blocksByName;

        if (!blocksByName[blockType]) {
          return createSuccessResponse(`Unknown block type: ${blockType}`);
        }

        const blockId = blocksByName[blockType].id;

        const block = botState.bot.findBlock({
          matching: blockId,
          maxDistance: maxDistance,
        });

        if (!block) {
          return createSuccessResponse(
            `No ${blockType} found within ${maxDistance} blocks`
          );
        }

        return createSuccessResponse(
          `Found ${blockType} at position (${block.position.x}, ${block.position.y}, ${block.position.z})`
        );
      } catch (error) {
        return createErrorResponse(error as Error);
      }
    }
  );
}
