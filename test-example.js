import faker from 'https://cdn.jsdelivr.net/npm/faker@5.5.3/dist/faker.min.js'
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'
import { check, fail, group, sleep } from 'k6'
import http from 'k6/http'
import { Rate } from 'k6/metrics'
import { isOK, validateSiteUrl } from './checks and helper.js'

const fields = {
  // wxample use of faker.js
  billing_first_name: faker.name.firstName(),
  billing_last_name: faker.name.lastName(),
  billing_company: faker.datatype.boolean() ? faker.company.companyName() : null,
  billing_country: 'US',
  billing_state: faker.address.stateAbbr(),
  billing_address_1: faker.address.streetAddress(),
  billing_address_2: faker.datatype.boolean() ? faker.address.secondaryAddress() : null,
  billing_city: faker.address.city(),
  billing_postcode: faker.address.zipCodeByState('DE'),
  billing_phone: faker.phone.phoneNumberFormat(),
  billing_email: randomIntBetween(1, 100) + '-' + faker.internet.exampleEmail(),
  order_comments: faker.datatype.boolean() ? faker.lorem.sentences() : null
}

export const options = {
  throw: true,
  summaryTimeUnit: 'ms',
  thresholds: {
    http_req_duration: [
      {
        threshold: 'p(95)<200'
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
  const siteUrl = __ENV.SITE_URL

  validateSiteUrl(siteUrl)

  const pause = {
    min: 3,
    max: 8
  }

  group('Load homepage', function () {
    const response = http.get(siteUrl)

    check(response, isOK) || (errorRate.add(1) && fail('status code was *not* 200'))
  })

  sleep(randomIntBetween(pause.min, pause.max))

  // group('Login', function () {
  //   const response = http.get(`${siteUrl}/my-account/`)
  //   check(response, isOK) || (errorRate.add(1) && fail('status code was *not* 200'))
  // })

  sleep(randomIntBetween(pause.min, pause.max))
}
