import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from "superjson";
import { headers } from 'next/headers';

export const createTRPCContext = cache(async () => {
  const authData = await auth();
  const headersList = await headers();
  const headersObj: Record<string, string> = {};
  
  // Get all headers as a plain object
  headersList.forEach((value, key) => {
    if (value) headersObj[key] = value;
  });
  
  return { 
    auth: authData,
    // Pass headers for things like getting the host (for absolute URLs)
    headers: headersObj
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    })
  }

  return next({
    ctx: {
      auth: ctx.auth,
    }
  })
})
// Base router and procedure helpers 
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);