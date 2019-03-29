
const postJSON = async (url, data = {}, options = {}) => {
    try {
        const headers = {
            ...options.headers,
            'content-type': 'application/json',
        }

        const fetchOptions = {
            ...options,
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        }

        const res = await fetch(url, fetchOptions)

        if (res.status !== 200) {
            const error = new Error(`${res.status} - ${res.statusText}`)
            error.response = res
            throw error
        }

        return await res.json()
    } catch (err) {
        throw err
    }
}

/**
 * Options:
 * - debug:        (bool: false)
 * - ignoreErrors: (bool: false) avoid to throw in case of graphql errors
 * - endpoint:     (string: null) provide a custom http endpoint
 *
 * Returns:
 * { data: {}, errors: [] }
 */
const runQuery = async (query = null, variables = {}, options = {}) => {
    if (!query) {
        throw new Error('[graphql] please provide a query')
    }

    const { endpoint, debug, ignoreErrors, ...otherOptions } = options
    let result = null

    const fetchOptions = {
        credentials: 'include',
        ...otherOptions,
    }

    if (debug) {
        console.log('>>>>>>>>>>>> GRAPHQL')
        console.log(endpoint || runQuery.endpoint)
        console.log(query)
        console.log(variables)
        console.log(fetchOptions)
        console.log(JSON.stringify(variables))
        console.log('<<<<<<<<<<< GRAPHQL')
    }

    try {
        result = await postJSON(endpoint || runQuery.endpoint, {
            query,
            variables,
        }, fetchOptions)
    } catch (err) {
        // must be a real network error
        if (!err.response) {
            const error = new Error(`[graphql] ${err.message}`)
            error.query = query
            error.originalError = err
            throw error
        }

        // might be a graphql handled error
        try {
            result = JSON.parse(await err.response.text())
        } catch (jsonErr) {
            throw err
        }
    }

    if (result.errors && ignoreErrors !== true) {
        const error = new Error(result.errors[0].message)
        error.graphQLErrors = result.errors
        error.graphQLResponse = result

        throw error
    }

    return result
}

const query = `mutation trackMetrics (
    $token: String!
    $metrics: [MetricRecord]!  
    $logs: [LogRecord]!  
) {
    api (token:$token) {
        trackMetrics (data: $metrics)
        trackLogs (data: $logs)
    }
}`

export const flush = async (chunk, target) => {
    const res = await runQuery(query, {
        token: target.token,
        metrics: chunk.metrics,
        events: chunk.events,
        logs: chunk.logs,
    }, {
        // debug: true,
        endpoint: target.endpoint,
    })

    return res.data.api.trackMetrics
}
