import { Octokit } from 'octokit'

interface CreateIssueParams {
  title: string
  body: string
  repo: string
  owner: string
  token: string
}

export const createIssue = async ({ title, body, repo, owner, token }: CreateIssueParams) => {
  const octokit = new Octokit({ auth: token })

  const response = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
  })

  return response.data
}
