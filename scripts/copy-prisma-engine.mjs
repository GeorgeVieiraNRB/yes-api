import { copyFile, mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceDirectory = path.join(projectRoot, "src", "generated", "prisma");
const targetDirectory = path.join(projectRoot, "dist", "generated", "prisma");

const generatedFiles = await readdir(sourceDirectory, { withFileTypes: true });
const engineFiles = generatedFiles
  .filter(
    (entry) =>
      entry.isFile() &&
      /^(?:lib)?query_engine.*\.node$/u.test(entry.name),
  )
  .map((entry) => entry.name);

if (engineFiles.length === 0) {
  throw new Error(
    "Prisma query engine was not found. Run npm run prisma:generate before building.",
  );
}

await mkdir(targetDirectory, { recursive: true });

await Promise.all(
  engineFiles.map((fileName) =>
    copyFile(
      path.join(sourceDirectory, fileName),
      path.join(targetDirectory, fileName),
    ),
  ),
);

console.info(`Copied ${engineFiles.length} Prisma query engine file(s) to dist.`);
