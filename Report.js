export function reportAggregate(stats, remoteCandidateAddress, localCandidateAddress) {
  function resolveIds(report1, idNames) {
    idNames.forEach((idName) => {
      if (idName.endsWith('Id') && typeof report1[idName] === 'string' && stats.has(report1[idName])) {
        let report2 = { ...stats.get(report1[idName]) }
        delete report2.id
        delete report2.type
        delete report2.timestamp
        if (idName === 'localCandidateId') report2.address = localCandidateAddress[report2.port]
        if (idName === 'remoteCandidateId') report2.address = remoteCandidateAddress[report2.port]
        report1[idName.slice(0, -2)] = report2
        delete report1[idName]
      }
    })
  }

  let result = []

  stats.forEach((report) => {
    const { type } = report
    if (type === 'candidate-pair') {
      if (report.nominated) {
        let report0 = { ...report }
        delete report0.id
        delete report0.timestamp
        resolveIds(report0, ['localCandidateId', 'remoteCandidateId'])
        result.push(report0)
      }
    }
    if (type === 'inbound-rtp') {
      let report0 = { ...report }
      delete report0.id
      delete report0.timestamp
      resolveIds(report0, ['codecId', 'remoteId'])
      result.push(report0)
    }
  })

  return result
}
