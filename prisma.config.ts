import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "prisma/migrations",
    // We override the migration connection pool using our unpooled direct url string
    directUrl: env("DIRECT_DATABASE_URL"),
  },
});
