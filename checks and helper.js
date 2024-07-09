import http from 'k6/http'
import exec from 'k6/execution'
import { fail } from 'k6'


export function validateSiteUrl (siteUrl) {
  if (! /^https?:\/\/[^\s$.?#].[^\s]*$/.test(siteUrl)) {
      exec.test.abort('Missing `SITE_URL` environment variable, or invalid URL')
  }

  if (siteUrl.endsWith('/')) {
      exec.test.abort('The `SITE_URL` must not have a trailing slash')
  }
}
export const isOK = {
  'response code is 200': response => response.status == 200
}
export const duration500 = {
  "Duration < 500ms": (r) => r.timings.duration < 500
}