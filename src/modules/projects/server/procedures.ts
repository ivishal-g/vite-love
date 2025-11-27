import { inngest } from "@/inngest/client";
import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { generateSlug } from "random-word-slugs"
import { TRPCError } from "@trpc/server";
import { consumeCredits } from "@/lib/usage";

export const projectsRouter = createTRPCRouter({
    gerOne: baseProcedure
        .input(z.object({
            id: z.string().min(1, { message: "Id is required" })
        }))
        .query(async ({ input }) => {
            const existingProject = await prisma.project.findUnique({
                where: {
                    id: input.id,
                },
            });

            if (!existingProject) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Project not found"});
            }

            return existingProject;
        }),
    getMany: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                console.log('Auth context:', {
                    userId: ctx.auth.userId,
                    sessionId: ctx.auth.sessionId,
                    orgId: ctx.auth.orgId
                });
                
                const projects = await prisma.project.findMany({
                    where: {
                        userId: ctx.auth.userId,
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
                
                console.log('Found projects:', projects);
                return projects;
            } catch (error) {
                console.error('Error in projects.getMany:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to fetch projects',
                });
            }
        }),
    create: protectedProcedure
        .input(
            z.object({
                value: z.string()
                    .min(1, { message: "Value is required" })
                    .max(10000, { message: "Value is too long" })
            }),
        )
        .mutation(async ({ input, ctx }) => {

            try {
                await consumeCredits(ctx.auth.userId);
            } catch (error) {
                console.error('Error consuming credits:', error);
                
                if (error instanceof Error) {
                    // If it's already a TRPCError, just rethrow it
                    if ('code' in error && typeof error.code === 'string' && 'message' in error) {
                        throw error;
                    }
                    
                    // Handle specific error messages
                    if (error.message.includes('not authenticated')) {
                        throw new TRPCError({ 
                            code: 'UNAUTHORIZED', 
                            message: 'Please sign in to create a project' 
                        });
                    }
                    
                    if (error.message.includes('run out of credits')) {
                        throw new TRPCError({
                            code: 'TOO_MANY_REQUESTS',
                            message: 'You have run out of credits. Please upgrade your plan to continue.'
                        });
                    }
                }
                
                // For any other errors, return a generic error
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to create project. Please try again later.'
                });
            }

            const createdProject = await prisma.project.create({
                data: {
                    userId: ctx.auth.userId,
                    name: generateSlug(2, {
                        format: "kebab",
                    }),
                    messages: {
                        create: {
                            content: input.value,
                            role: "USER",
                            type: "RESULT",
                        }
                    }
                }
            })

            await inngest.send({
                name: "code-agent/run",
                data: {
                    value: input.value,
                    projectId: createdProject.id,
                }
            })
            return createdProject;
        }),

})