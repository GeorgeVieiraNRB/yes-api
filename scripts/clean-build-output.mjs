import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const buildDirectory = path.join(projectRoot, "dist");

if (path.dirname(buildDirectory) !== projectRoot) {
  throw new Error("Refusing to clean a build directory outside the project root.");
}

await rm(buildDirectory, { recursive: true, force: true });
