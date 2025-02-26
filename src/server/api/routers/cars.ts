// server/api/routers/cars.ts
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const carsRouter = createTRPCRouter({
  getAllCars: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.cars.findMany({
      orderBy: { added: "desc" },
    });
  }),

  getCarById: publicProcedure
    .input(z.object({ carId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.cars.findFirst({
        where: { carId: input.carId },
      });
    }),
});
