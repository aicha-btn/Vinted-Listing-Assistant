import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { savedListingFixture } from '../../test/fixtures'
import {
  addStoredListing,
  getStoredListings,
  removeStoredListing,
  saveStoredListings,
  updateStoredListingStatus,
} from './storage'

class MemoryStorage {
  private values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

const originalWindow = globalThis.window

describe('listing storage', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: storage },
    })
  })

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    })
  })

  it('returns an empty history when storage has no value', () => {
    expect(getStoredListings()).toEqual([])
  })

  it('saves and reads listing history', () => {
    saveStoredListings([savedListingFixture])
    expect(getStoredListings()).toEqual([savedListingFixture])
  })

  it('places a new entry first and replaces an entry with the same id', () => {
    addStoredListing(savedListingFixture)
    addStoredListing({ ...savedListingFixture, status: 'published' })
    expect(getStoredListings()).toEqual([
      { ...savedListingFixture, status: 'published' },
    ])
  })

  it('updates only the matching listing status', () => {
    const second = { ...savedListingFixture, id: 'saved-demo-2' }
    saveStoredListings([savedListingFixture, second])
    expect(updateStoredListingStatus(savedListingFixture.id, 'sold')).toEqual([
      { ...savedListingFixture, status: 'sold' },
      second,
    ])
  })

  it('removes only the requested listing', () => {
    const second = { ...savedListingFixture, id: 'saved-demo-2' }
    saveStoredListings([savedListingFixture, second])
    expect(removeStoredListing(savedListingFixture.id)).toEqual([second])
  })

  it('returns an empty history for corrupted JSON', () => {
    storage.setItem('vinted-listing-assistant-history', '{broken')
    expect(getStoredListings()).toEqual([])
  })

  it('returns an empty history for a non-array JSON value', () => {
    storage.setItem('vinted-listing-assistant-history', '{"id":"wrong-shape"}')
    expect(getStoredListings()).toEqual([])
  })
})
