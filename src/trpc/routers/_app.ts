import { projectsRouter } from '@/modules/projects/server/procedures';
import { createTRPCRouter } from '../init';
import { messageRouter } from '@/modules/messages/server/procedures';
import { usageRouter } from '@/modules/usage/server/procedures';
export const appRouter = createTRPCRouter({
  usage: usageRouter,
  projects: projectsRouter, 
  messages: messageRouter,
});

export type AppRouter = typeof appRouter;