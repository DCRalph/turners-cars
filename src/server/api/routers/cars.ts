// server/api/routers/cars.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const carsRouter = createTRPCRouter({
  getAllCars: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        search: z.string().optional(),
        sortBy: z
          .enum(["added", "lastSeen", "carPrice", "carName"])
          .default("lastSeen"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, offset, search, sortBy, sortOrder } = input;

      const where = search
        ? {
          OR: [
            { carName: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
            { carId: { contains: search, mode: "insensitive" as const } },
          ],
        }
        : {};

      const [cars, total] = await Promise.all([
        ctx.db.cars.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          take: limit,
          skip: offset,
        }),
        ctx.db.cars.count({ where }),
      ]);

      return {
        cars,
        total,
        hasMore: total > offset + limit,
      };
    }),

  getCarById: publicProcedure
    .input(z.object({ carId: z.string() }))
    .query(async ({ ctx, input }) => {
      const car = await ctx.db.cars.findUnique({
        where: { carId: input.carId },
      });

      if (!car) {
        throw new Error("Car not found");
      }

      return car;
    }),

  getCarByDbId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const car = await ctx.db.cars.findUnique({
        where: { id: input.id },
      });

      if (!car) {
        throw new Error("Car not found");
      }

      return car;
    }),

  getStats: publicProcedure.query(async ({ ctx }) => {
    const [total, recentlyAdded, recentlySeen] = await Promise.all([
      ctx.db.cars.count(),
      ctx.db.cars.count({
        where: {
          added: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
      ctx.db.cars.count({
        where: {
          lastSeen: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      total,
      recentlyAdded,
      recentlySeen,
    };
  }),
});
