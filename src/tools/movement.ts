import pkg from "mineflayer-pathfinder";
import { Vec3 } from "vec3";
import { z } from "zod";
import { botState, server } from "../server.js";
import { ToolResponse } from "../types.js";
import {
  createErrorResponse,
  createNotConnectedResponse,
  createSuccessResponse,
} from "../utils/error-handler.js";
const { Movements, goals } = pkg;

// Function to register movement-related tools
export function registerMovementTools() {
  // Tool to get current position information
  server.tool(
    "getPosition",
    "Get the current position of the player in the Minecraft world",
    {},
    async () => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }

      try {
        const position = botState.bot.entity.position;
        return createSuccessResponse(
          `Current position: X=${position.x.toFixed(2)}, Y=${position.y.toFixed(
            2
          )}, Z=${position.z.toFixed(2)}`
        );
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  // Tool to move to a specified location
  server.tool(
    "moveTo",
    "Move the player to a specific location",
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
        // Set pathfinder Movements
        const movements = new Movements(botState.bot);
        botState.bot.pathfinder.setMovements(movements);

        // Set target position
        const goal = new goals.GoalBlock(x, y, z);

        return new Promise<ToolResponse>((resolve) => {
          // Start movement
          botState
            .bot!.pathfinder.goto(goal)
            .then(() => {
              resolve(
                createSuccessResponse(
                  `Successfully moved to X=${x}, Y=${y}, Z=${z}`
                )
              );
            })
            .catch((err) => {
              resolve(createErrorResponse(err));
            });

          // Timeout handling (if still moving after 1 minute)
          setTimeout(() => {
            resolve(
              createSuccessResponse(
                "Movement is taking longer than expected. Still trying to reach the destination..."
              )
            );
          }, 60000);
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }
  );

  server.tool(
    "flyTo",
    "Make the bot fly to a specific position",
    {
      x: z.number().describe("X coordinate"),
      y: z.number().describe("Y coordinate"),
      z: z.number().describe("Z coordinate"),
    },
    async ({ x, y, z }) => {
      if (!botState.isConnected || !botState.bot) {
        return createNotConnectedResponse();
      }

      if (!botState.bot.creative) {
        return createSuccessResponse(
          "Creative mode is not available. Cannot fly."
        );
      }

      const currentPos = botState.bot.entity.position;
      console.error(
        `Flying from (${Math.floor(currentPos.x)}, ${Math.floor(
          currentPos.y
        )}, ${Math.floor(currentPos.z)}) to (${Math.floor(x)}, ${Math.floor(
          y
        )}, ${Math.floor(z)})`
      );

      const controller = new AbortController();
      const FLIGHT_TIMEOUT_MS = 20000;

      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      }, FLIGHT_TIMEOUT_MS);

      try {
        const destination = new Vec3(x, y, z);

        await createCancellableFlightOperation(
          botState.bot,
          destination,
          controller
        );

        return createSuccessResponse(
          `Successfully flew to position (${x}, ${y}, ${z}).`
        );
      } catch (error) {
        if (controller.signal.aborted) {
          const currentPosAfterTimeout = botState.bot.entity.position;
          return createErrorResponse(
            `Flight timed out after ${
              FLIGHT_TIMEOUT_MS / 1000
            } seconds. The destination may be unreachable. ` +
              `Current position: (${Math.floor(
                currentPosAfterTimeout.x
              )}, ${Math.floor(currentPosAfterTimeout.y)}, ${Math.floor(
                currentPosAfterTimeout.z
              )})`
          );
        }

        console.error("Flight error:", error);
        return createErrorResponse(error as Error);
      } finally {
        clearTimeout(timeoutId);
        botState.bot.creative.stopFlying();
      }
    }
  );
}
function createCancellableFlightOperation(
  bot: any,
  destination: Vec3,
  controller: AbortController
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let aborted = false;

    controller.signal.addEventListener("abort", () => {
      aborted = true;
      bot.creative.stopFlying();
      reject(new Error("Flight operation cancelled"));
    });

    bot.creative
      .flyTo(destination)
      .then(() => {
        if (!aborted) {
          resolve(true);
        }
      })
      .catch((err: any) => {
        if (!aborted) {
          reject(err);
        }
      });
  });
}
