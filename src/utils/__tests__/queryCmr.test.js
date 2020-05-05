import nock from 'nock'

import { queryCmr } from '../queryCmr'

describe('queryCmr', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }

    delete process.env.NODE_ENV

    process.env.cmrRootUrl = 'http://example.com'
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test('queries cmr', async () => {
    nock(/example/, {
      reqheaders: {
        'CMR-Request-ID': 'abcd-1234-efgh-5678'
      }
    })
      .post(/collections\.json/)
      .reply(200, {
        feed: {
          entry: [{
            id: 'C100000-EDSC'
          }]
        }
      })

    const response = await queryCmr(
      'collections',
      {},
      { 'CMR-Request-ID': 'abcd-1234-efgh-5678' }
    )

    const { data } = response
    expect(data).toEqual({
      feed: {
        entry: [{
          id: 'C100000-EDSC'
        }]
      }
    })
  })

  describe('when provided a format', () => {
    test('queries cmr', async () => {
      nock(/example/, {
        reqheaders: {
          'CMR-Request-ID': 'abcd-1234-efgh-5678'
        }
      })
        .post(/collections\.umm_json/)
        .reply(200, {
          feed: {
            entry: [{
              id: 'C100000-EDSC'
            }]
          }
        })

      const response = await queryCmr(
        'collections',
        {},
        { 'CMR-Request-ID': 'abcd-1234-efgh-5678' },
        { format: 'umm_json' }
      )

      const { data } = response
      expect(data).toEqual({
        feed: {
          entry: [{
            id: 'C100000-EDSC'
          }]
        }
      })
    })
  })

  describe('when provided a token', () => {
    test('queries cmr', async () => {
      nock(/example/, {
        reqheaders: {
          'CMR-Request-ID': 'abcd-1234-efgh-5678',
          'Echo-Token': 'test-token'
        }
      })
        .post(/collections\.json/)
        .reply(200, {
          feed: {
            entry: [{
              id: 'C100000-EDSC'
            }]
          }
        })

      const response = await queryCmr(
        'collections',
        {},
        {
          'CMR-Request-ID': 'abcd-1234-efgh-5678',
          'Echo-Token': 'test-token'
        }
      )

      const { data } = response
      expect(data).toEqual({
        feed: {
          entry: [{
            id: 'C100000-EDSC'
          }]
        }
      })
    })
  })

  describe('when an error is returned', () => {
    test('throws an exception', async () => {
      nock(/example/, {
        reqheaders: {
          'CMR-Request-ID': 'abcd-1234-efgh-5678'
        }
      })
        .post(/collections\.json/)
        .reply(500, {
          errors: ['HTTP Error']
        })

      const response = queryCmr(
        'collections',
        {},
        {
          'CMR-Request-ID': 'abcd-1234-efgh-5678'
        }
      )

      await expect(response).rejects.toThrow()
    })
  })
})