import { Octokit } from 'octokit';

interface CreateIssueParams {
  title: string;
  body: string;
  repo: string;
  owner: string;
  token: string;
  baseUrl?: string;
}

export const createIssue = async ({
  title,
  body,
  repo,
  owner,
  token,
  baseUrl,
}: CreateIssueParams) => {
  const octokit = new Octokit({
    auth: token,
    ...(baseUrl && { baseUrl }),
  });

  const response = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
  });

  return response.data;
};
