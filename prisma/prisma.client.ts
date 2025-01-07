import { PrismaClient } from "@prisma/client";

/**
 * @description
 * this file is to connect to the database and return the client
 */
const prisma = new PrismaClient();

export default prisma;
