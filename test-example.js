import faker from 'https://cdn.jsdelivr.net/npm/faker@5.5.3/dist/faker.min.js'
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'
import { check, fail, group, sleep } from 'k6'
import http from 'k6/http'
import { Rate } from 'k6/metrics'
import { responseTimeLess500ms, statusOK, validateSiteUrl } from './checks and helper.js'
import { logErrorRequest } from './helper.js'
const user = {
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  company: faker.datatype.boolean() ? faker.company.companyName() : null,
  country: faker.address.country(),
  state: faker.address.stateAbbr(),
  address_1: faker.address.streetAddress(),
  address_2: faker.datatype.boolean() ? faker.address.secondaryAddress() : null,
  city: faker.address.city(),
  postcode: faker.address.zipCodeByState('DE'),
  phone: faker.phone.phoneNumberFormat(),
  email: randomIntBetween(1, 100) + '-' + faker.internet.exampleEmail()
}
const TEST_2_RUN = __ENV.TEST_2_RUN ? __ENV.TEST_2_RUN : 'smoke'
const ENV_2_RUN = __ENV.ENV_2_RUN ? __ENV.ENV_2_RUN : 'dev'
const BASE_URL = __ENV.SITE_URL ? __ENV.SITE_URL : 'https://reqres.in/api/users'
// Constants
const EnvToRun = {
  dev: 'dev',
  test: 'test',
  prod: 'prod'
}
export const options = {
  throw: true,
  summaryTimeUnit: 'ms',
  thresholds: {
    http_req_duration: [
      {
        threshold: 'p(95)<500'
      }
    ],
    checks: [
      {
        threshold: 'rate>0.9'
      }
    ],
    errors: ['rate<0.1']
  },
  scenarios: {
    ramping: {
      executor: 'ramping-vus',
      startVUs: 1,
      gracefulStop: '10s',
      gracefulRampDown: '10s',
      stages: [{ duration: '1m', target: 100 }]
    },
    constant: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
      gracefulStop: '10s'
    }
  }
}
const errorRate = new Rate('errors')
export function setup() {
  return {
    startedAt: Date.now()
  }
}
export function teardown(data) {
  const startedAt = new Date(data.startedAt)
  const endedAt = new Date()

  console.info(`Run started at ${startedAt.toJSON()}`)
  console.info(`Run ended at   ${endedAt.toJSON()}`)
}
export default function () {
  const siteUrl = BASE_URL

  validateSiteUrl(siteUrl)

  const pause = {
    min: 3,
    max: 8
  }
  group('Get Users', function () {
    const response = http.get(siteUrl)
    check(response, statusOK) || (errorRate.add(1) && fail('status code was *not* 200'))
    check(response, responseTimeLess500ms) || (errorRate.add(1) && fail('duration was *not* < 500ms'))
  })
  sleep(randomIntBetween(pause.min, pause.max))
}
