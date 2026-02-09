import simpleGit, { SimpleGit } from "simple-git";

const git: SimpleGit = simpleGit();

export async function checkoutSpecificVersion(repoUrl: string, commitHash: string, localPath: string) {
  await git.clone(repoUrl, localPath, ["--depth", "1"]);
  const repo = simpleGit(localPath);
  await repo.fetch(["--depth", "1", "origin", commitHash]);
  await repo.checkout(commitHash);
}
