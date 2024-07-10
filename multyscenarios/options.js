export const opts = (Execution) => {
  let ExecutionOptions_Scenarios

  switch (Execution) {
    case 'smoke':
      ExecutionOptions_Scenarios = {
        BackendRead_scenario: {
          exec: 'BackendReadTest',
          executor: 'ramping-arrival-rate',
          startTime: '0s',
          startRate: 1,
          preAllocatedVUs: 4,
          stages: [
            { duration: '30s', target: 1 },
            { duration: '30s', target: 2 }
          ]
        },
        BackendFlow_scenario: {
          exec: 'BackendFlowTest',
          executor: 'ramping-arrival-rate',
          startTime: '10s',
          startRate: 2,
          preAllocatedVUs: 8,
          stages: [
            { duration: '30s', target: 2 },
            { duration: '30s', target: 4 }
          ]
        },
        Frontend_scenario: {
          exec: 'FrontendSimpleTest',
          executor: 'ramping-vus',
          startTime: '20s',
          startVUs: 1,
          stages: [{ duration: '60s', target: 1 }]
        },
        GraphQL_scenario: {
          exec: 'GraphQLEndpointTest',
          executor: 'ramping-vus',
          startTime: '30s',
          startVUs: 1,
          stages: [{ duration: '60s', target: 1 }]
        }
      }
      break // end case ExecutionType.smoke
    case 'load':
      ExecutionOptions_Scenarios = {
        BackendRead_scenario: {
          exec: 'BackendReadTest',
          executor: 'ramping-arrival-rate',
          startTime: '0s',
          startRate: 1,
          preAllocatedVUs: 4,
          stages: [
            { duration: '30s', target: 2 },
            { duration: '45m', target: 2 }
          ]
        },
        BackendFlow_scenario: {
          exec: 'BackendFlowTest',
          executor: 'ramping-arrival-rate',
          startTime: '0s',
          startRate: 2,
          preAllocatedVUs: 8,
          stages: [
            { duration: '30s', target: 4 },
            { duration: '45m', target: 4 }
          ]
        },
        Frontend_scenario: {
          exec: 'FrontendSimpleTest',
          executor: 'ramping-vus',
          startTime: '0s',
          startVUs: 1,
          stages: [{ duration: '45m', target: 1 }]
        },
        GraphQL_scenario: {
          exec: 'GraphQLEndpointTest',
          executor: 'ramping-vus',
          startTime: '0s',
          startVUs: 1,
          stages: [{ duration: '45m', target: 1 }]
        }
      }
      break // end case ExecutionType.load
    case 'stress':
      ExecutionOptions_Scenarios = {
        BackendRead_scenario: {
          exec: 'BackendReadTest',
          executor: 'ramping-arrival-rate',
          startTime: '0s',
          startRate: 10,
          preAllocatedVUs: 160,
          stages: [
            { duration: '5m', target: 10 },
            { duration: '5m', target: 20 },
            { duration: '5m', target: 40 },
            { duration: '5m', target: 80 }
          ]
        },
        BackendFlow_scenario: {
          exec: 'BackendFlowTest',
          executor: 'ramping-arrival-rate',
          startTime: '0s',
          startRate: 10,
          preAllocatedVUs: 160,
          stages: [
            { duration: '5m', target: 10 },
            { duration: '5m', target: 20 },
            { duration: '5m', target: 40 },
            { duration: '5m', target: 80 }
          ]
        },
        Frontend_scenario: {
          exec: 'FrontendSimpleTest',
          executor: 'ramping-vus',
          startTime: '0s',
          startVUs: 1,
          stages: [
            { duration: '20m', target: 1 } // we don't want to stress these endpoints, not for stress testing - just for example so let's be kind ;)
          ]
        },
        GraphQL_scenario: {
          exec: 'GraphQLEndpointTest',
          executor: 'ramping-vus',
          startTime: '0s',
          startVUs: 1,
          stages: [
            { duration: '20m', target: 1 } // we don't want to stress these endpoints, not for stress testing - just for example so let's be kind ;)
          ]
        }
      }
      break // end case ExecutionType.stress
    case 'soak':
      ExecutionOptions_Scenarios = {
        BackendRead_scenario: {
          exec: 'BackendReadTest',
          executor: 'ramping-arrival-rate',
          startTime: '0s',
          startRate: 1,
          preAllocatedVUs: 40,
          stages: [
            { duration: '5m', target: 5 },
            { duration: '5m', target: 10 },
            { duration: '8h', target: 20 }
          ]
        },
        BackendFlow_scenario: {
          exec: 'BackendFlowTest',
          executor: 'ramping-arrival-rate',
          startTime: '0s',
          startRate: 1,
          preAllocatedVUs: 40,
          stages: [
            { duration: '5m', target: 5 },
            { duration: '5m', target: 10 },
            { duration: '8h', target: 20 }
          ]
        },
        Frontend_scenario: {
          exec: 'FrontendSimpleTest',
          executor: 'ramping-vus',
          startTime: '0s',
          startVUs: 1,
          stages: [
            { duration: '8h', target: 1 } // we don't want to stress these endpoints, not for stress testing - just for example so let's be kind ;)
          ]
        },
        GraphQL_scenario: {
          exec: 'GraphQLEndpointTest',
          executor: 'ramping-vus',
          startTime: '0s',
          startVUs: 1,
          stages: [
            { duration: '8h', target: 1 } // we don't want to stress these endpoints, not for stress testing - just for example so let's be kind ;)
          ]
        }
      }
      break // end case ExecutionType.soak
  }

  return ExecutionOptions_Scenarios
}
