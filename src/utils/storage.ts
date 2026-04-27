import type { ListingStatus, SavedListing } from '../types/listing'

const STORAGE_KEY = 'vinted-listing-assistant-history'

const canUseStorage = () => typeof window !== 'undefined'

export function getStoredListings() {
  if (!canUseStorage()) {
    return [] as SavedListing[]
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return [] as SavedListing[]
    }

    const parsedValue = JSON.parse(rawValue)
    return Array.isArray(parsedValue) ? (parsedValue as SavedListing[]) : []
  } catch {
    return [] as SavedListing[]
  }
}

export function saveStoredListings(listings: SavedListing[]) {
  if (!canUseStorage()) {
    return listings
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
  return listings
}

export function addStoredListing(entry: SavedListing) {
  const existingListings = getStoredListings().filter(
    (listing) => listing.id !== entry.id,
  )
  const updatedListings = [entry, ...existingListings]
  return saveStoredListings(updatedListings)
}

export function removeStoredListing(id: string) {
  const updatedListings = getStoredListings().filter((listing) => listing.id !== id)
  return saveStoredListings(updatedListings)
}

export function updateStoredListingStatus(id: string, status: ListingStatus) {
  const updatedListings = getStoredListings().map((listing) =>
    listing.id === id ? { ...listing, status } : listing,
  )

  return saveStoredListings(updatedListings)
}
