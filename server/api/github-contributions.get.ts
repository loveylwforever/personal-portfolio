import { profile } from '../../data/profile'

type ContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE'

type GhDay = {
  date: string
  contributionCount: number
  contributionLevel: ContributionLevel
}

type GhResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions: number
          weeks: { contributionDays: GhDay[] }[]
        }
      }
    }
  }
  errors?: { message: string }[]
}

const LEVEL_MAP: Record<ContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4
}

const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`

export default cachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = String(config.githubToken || '')
  const username = profile.githubUsername

  if (!token) {
    throw createError({
      statusCode: 503,
      statusMessage: 'GITHUB_TOKEN is not configured'
    })
  }

  const payload = await $fetch<GhResponse>('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'gaojian-portfolio'
    },
    body: {
      query: QUERY,
      variables: { login: username }
    }
  })

  if (payload.errors?.length) {
    throw createError({
      statusCode: 502,
      statusMessage: payload.errors[0]?.message || 'GitHub GraphQL error'
    })
  }

  const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar
  if (!calendar) {
    throw createError({
      statusCode: 404,
      statusMessage: `GitHub user not found: ${username}`
    })
  }

  const days = calendar.weeks.flatMap(week =>
    week.contributionDays.map(day => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_MAP[day.contributionLevel] ?? 0
    }))
  )

  return {
    username,
    total: calendar.totalContributions,
    days
  }
}, {
  maxAge: 60 * 60,
  name: 'github-contributions',
  getKey: () => profile.githubUsername
})
