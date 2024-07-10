export function formatDate(date) {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes
  let strTime = hours + ':' + minutes + ' ' + ampm
  return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + '  ' + strTime
}

export function DebugOrLog(textToLog, start = Date.now(), DEBUG = false) {
  if (DEBUG) {
    let millis = Date.now() - start // we get the ms ellapsed from the start of the test
    let time = Math.floor(millis / 1000) // in seconds
    // console.log(`${time}se: ${textToLog}`) // se = Seconds elapsed
    console.log(`${textToLog}`)
  }
}
