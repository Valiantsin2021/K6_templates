// Function to get formatted timestamp

export const getTimestamp = () => {
  const date = new Date()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')

  return `${hours}:${minutes}:${seconds}.${milliseconds}`
}

// Logger function with different log levels

export const logger = {
  info(...val) {
    console.log(getTimestamp(), ...val)
  },
  warn(...val) {
    console.warn(getTimestamp(), ...val)
  },
  error(...val) {
    console.error(getTimestamp(), ...val)
  }
}

// Function to log response time exceeding threshold

export const logWaitingTime = ({ metric, response, messageType }) => {
  const responseTimeThreshold = 1000
  let requestId = ''
  let responseTime = response.timings.waiting
  try {
    let json = response.json()
    requestId = json.requestId
  } catch (err) {
    // noop
  }

  // Log any responses that far longer than expected so we can troubleshoot those particular queries
  if (responseTime > responseTimeThreshold) {
    logger.warn(`${messageType} with requestId '${requestId}' took longer than ${responseTimeThreshold}`)
  }
  metric.add(responseTime)
}

// Function to log errors in the response body

export const logErrorRequest = ({ metric, response, messageType }) => {
  let requestId = ''
  try {
    let json = response.json()
    requestId = json.requestId
  } catch (err) {
    // noop
  }

  // Log any responses that resulted with error in the body so we can trace those
  logger.warn(`${messageType} with requestId '${requestId}' resulted with body error code ${response.json().errorCode} and error message ${response.json().errorMessage}`)
  metric.add(1)
}
