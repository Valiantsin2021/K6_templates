import exec from 'k6/execution'

export function validateSiteUrl(siteUrl) {
  if (!/^https?:\/\/[^\s$.?#].[^\s]*$/.test(siteUrl)) {
    exec.test.abort('Missing `SITE_URL` environment variable, or invalid URL')
  }

  if (siteUrl.endsWith('/')) {
    exec.test.abort('The `SITE_URL` must not have a trailing slash')
  }
}
export const statusOK = { 'response code is 200': (response) => response.status == 200 }
export const responseTimeLess500ms = { 'Response time < 500ms': (response) => response.timings.duration < 500 }
export const bodyNotNull = { 'body is not null': (response) => response.body != null }
export const bodyInternalError = { 'body error status is OK': (response) => response.json().status === 'OK' }
export const contentTypeJson = { 'Content-Type is application/json': (response) => response.headers['Content-Type'] === 'application/json' }
export const responseTimeLess1s = { 'Response time < 1000ms': (response) => response.timings.duration < 1000 }
export const errorCodeCheck = { 'No error codes in body': (response) => !['error', 'fail'].includes(response.json().status) }
export const headerRateLimitPresent = { 'X-RateLimit-Limit header present': (response) => response.headers.hasOwnProperty('X-RateLimit-Limit') }
export const statusNot404 = { 'is not status 404': (response) => response.status !== 404 }
