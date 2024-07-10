import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js'
import { check, group, sleep } from 'k6'
import { parseHTML } from 'k6/html'
import http from 'k6/http'
import { Counter, Trend } from 'k6/metrics'
import { opts } from './options.js'
import { DebugOrLog, formatDate } from './utils.js'
// Constants
const EnvToRun = {
  dev: 'dev',
  test: 'test',
  prod: 'prod'
}

const executionType = {
  load: 'load',
  smoke: 'smoke',
  stress: 'stress',
  soak: 'soak'
}

// Process arguments
const TOKEN_USERNAME = __ENV.TOKEN_USERNAME
const TOKEN_PASSWORD = __ENV.TOKEN_PASSWORD
const TEST = __ENV.TEST ? __ENV.TEST : executionType.smoke
const ENV = __ENV.ENV ? __ENV.ENV : EnvToRun.dev

// Parameters & Constants
const USERNAME = TOKEN_USERNAME || `${randomString(10)}@example.com`
const PASSWORD = TOKEN_PASSWORD || randomString(10, '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
// const SampleURLWithEnvironment = 'https://.' + ENV + '.microsoft.appservice.com' // just for reference
const BASE_URL = 'https://test-api.k6.io'
const GraphQL_RickNMorty_URL = 'https://rickandmortyapi.com/graphql' // taken from https://rickandmortyapi.com/
const DEBUG = __ENV.DEBUG ? __ENV.DEBUG : false
const start = Date.now()

// Custom metrics

// Counters
let sampleCounter = new Counter('sampleCounter')
let BackendReadCounter = new Counter('BackendReadCounter')
let SimpleUICounter = new Counter('SimpleUICounter')

// Trends
// let sampleTrend_Trend = new Trend('sampleTrend_Trend')
let BackendRead_Trend = new Trend('BackendRead_Trend')
let SimpleUI_Trend = new Trend('SimpleUI_Trend')

let Execution = TEST // ExecutionType.smoke;
const ExecutionOptions_Scenarios = opts(Execution)

export let options = {
  scenarios: ExecutionOptions_Scenarios,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    'http_req_duration{name:PublicCrocs}': ['avg<400'],
    'http_req_duration{name:k6SiteUIcheck}': ['avg<400'],
    'http_req_duration{name:Create}': ['avg<600', 'max<1000']
  }
}

// Testing the backend just with reads
export function BackendReadTest(authToken) {
  let idCroc = randomIntBetween(1, 8)

  let res = http.get(`${BASE_URL}/public/crocodiles/1/`, { tags: { name: 'PublicCrocs' } })

  const isSuccessfulRequest = check(res, {
    'Document request succeed': () => res.status == 200
  })

  if (isSuccessfulRequest) {
    // DebugOrLog(`response.body: ${res.body}`, start, DEBUG)
    BackendRead_Trend.add(res.timings.duration)
    BackendReadCounter.add(1)
    let body = JSON.parse(res.body)
    var age = body.age

    check(age, {
      'Crocs are older than 5 years': Math.min(age) > 5
    })
  }
}

// Testing the backend with an end-to-end workflow (essentially the advanced API Flow sample at https://k6.io/docs/examples/advanced-api-flow/)
export function BackendFlowTest(authToken) {
  const requestConfigWithTag = (tag) => ({
    headers: {
      Authorization: `Bearer ${authToken}`
    },
    tags: Object.assign(
      {},
      {
        name: 'PrivateCrocs'
      },
      tag
    )
  })

  group('Create and modify crocs', () => {
    let URL = `${BASE_URL}/my/crocodiles/`

    group('Create crocs', () => {
      const payload = {
        name: `Name ${randomString(10)}`,
        sex: 'M',
        date_of_birth: '2001-01-01'
      }

      const res = http.post(URL, payload, requestConfigWithTag({ name: 'Create' }))

      if (check(res, { 'Croc created correctly': (r) => r.status === 201 })) {
        URL = `${URL}${res.json('id')}/`
      } else {
        DebugOrLog(`Unable to create a Croc ${res.status} ${res.body}`, start, DEBUG)

        return
      }
    })

    group('Update croc', () => {
      const payload = { name: 'New name' }
      const res = http.patch(URL, payload, requestConfigWithTag({ name: 'Update' }))
      const isSuccessfulUpdate = check(res, {
        'Update worked': () => res.status === 200,
        'Updated name is correct': () => res.json('name') === 'New name'
      })

      if (!isSuccessfulUpdate) {
        DebugOrLog(`Unable to update the croc ${res.status} ${res.body}`, start, DEBUG)
        return
      }
    })

    const delRes = http.del(URL, null, requestConfigWithTag({ name: 'Delete' }))

    const isSuccessfulDelete = check(null, {
      'Croc was deleted correctly': () => delRes.status === 204
    })

    if (!isSuccessfulDelete) {
      DebugOrLog(`Croc was not deleted properly`, start, DEBUG)
      return
    }
  })

  sleep(1)
}

export function FrontendSimpleTest(authToken) {
  let res = http.get(`${BASE_URL}/`, { tags: { name: 'k6SiteUIcheck' } })

  const isSuccessfulRequest = check(res, {
    'Document request succeed': () => res.status == 200
  })

  if (isSuccessfulRequest) {
    SimpleUI_Trend.add(res.timings.duration)
    SimpleUICounter.add(1)
    var doc = parseHTML(res.body) // equivalent to res.html()
    var pageTitle = doc.find('head title').text()
    var langAttr = doc.find('html').attr('lang')

    DebugOrLog(`title: ${pageTitle} lang attribute: ${langAttr}`, start, DEBUG)
    const checkLang = check(langAttr, {
      'language is english': langAttr == 'en'
    })

    const checkTitle = check(pageTitle, {
      'The title is correct': pageTitle == 'APIs demonstrating the power of k6'
    })

    if (checkLang != true || checkTitle != true) {
      DebugOrLog(`The title or language were wrong at ${BASE_URL}...`)
    }
  }

  sleep(10)
}

// Testing the backend just with reads
export function GraphQLEndpointTest(authToken) {
  let headers = {
    // Authorization: `Bearer ${authToken}`, // This GraphQL server does not require authentication so we provide no token in the header
    'Content-Type': 'application/json'
  }
  let Query_allRicknMorty_Humans = `
    query{
        characters (filter: {species: "Human"}){
          results{
            id
            name
            status
            species
          }
        }
      }`

  let res = http.post(GraphQL_RickNMorty_URL, JSON.stringify({ query: Query_allRicknMorty_Humans }), { headers: headers })

  const isSuccessfulRequest = check(res, {
    'HTML post succeed': () => res.status == 200
  })

  if (isSuccessfulRequest) {
    let body = JSON.parse(res.body)
    let errors = body.errors
    let GraphQLerrors = false

    if (errors) {
      DebugOrLog(`Found a GraphQL Error: ${errors[0].message}`) //Could be more than one, should iterate through them...
      GraphQLerrors = true
    }

    const hasNoGraphQLErrors = check(body, {
      'GraphQL request succeed': () => GraphQLerrors == false
    })
    if (hasNoGraphQLErrors) {
      // DebugOrLog(`The response of the GraphQL API is:${res.body}`, start, DEBUG)
      let name = body.data.characters.results[0].name
      DebugOrLog(`And the name of the first character is: ${name}`, start, DEBUG)
    }
  } else {
    DebugOrLog(`The http.Post failed!!!`, start, DEBUG)
  }

  sleep(15)
}

// setup configuration
export function setup() {
  DebugOrLog(`== SETUP BEGIN ===========================================================`)
  // log the date & time start of the test
  DebugOrLog(`Start of test: ${formatDate(new Date())}`, start, DEBUG)

  // log the test type
  DebugOrLog(`Test executed: ${Execution}`, start, DEBUG)

  // Log the environment
  DebugOrLog(`This test will run on the ${ENV} environment.`, start, DEBUG)

  // register a new user and authenticate via a Bearer token.
  let res = http.post(`${BASE_URL}/user/register/`, {
    first_name: 'Crocodile',
    last_name: 'Owner',
    username: USERNAME,
    password: PASSWORD
  })

  const isSuccessfulRequest = check(res, {
    'created user': (r) => r.status === 201
  })

  if (isSuccessfulRequest) {
    DebugOrLog(`The user ${USERNAME} was created successfully!`, start, DEBUG)
  } else {
    DebugOrLog(`There was a problem creating the user ${USERNAME}. It might be existing, so please modify it on the executor bat file`, start, DEBUG)
    DebugOrLog(`The http status is ${res.status}`, start, DEBUG)
    DebugOrLog(`The http error is ${res.error}`, start, DEBUG)
  }

  let loginRes = http.post(`${BASE_URL}/auth/token/login/`, {
    username: USERNAME,
    password: PASSWORD
  })

  let authToken = loginRes.json('access')
  let logInSuccessful = check(authToken, {
    'logged in successfully': () => authToken !== ''
  })

  if (logInSuccessful) {
    DebugOrLog(`Logged in successfully with the token: ${authToken}`, start, DEBUG)
  }

  DebugOrLog(`== SETUP END ===========================================================`, start, DEBUG)

  return authToken
}
export function teardown() {
  DebugOrLog(`== TEARDOWN ===========================================================`)
  DebugOrLog(`End of test: ${formatDate(new Date())}`, start, DEBUG)
}
