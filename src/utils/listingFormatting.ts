import type { GeneratedListing } from '../types/listing'

export const formatPriceRange = (listing: Pick<GeneratedListing, 'priceEstimate'>) =>
  `${listing.priceEstimate.suggestedMin} € - ${listing.priceEstimate.suggestedMax} €`

export const buildFullListingText = (
  listing: Pick<
    GeneratedListing,
    | 'title'
    | 'shortDescription'
    | 'detailedDescription'
    | 'hashtags'
    | 'priceEstimate'
  >,
) =>
  [
    `Titre : ${listing.title}`,
    `Description courte : ${listing.shortDescription}`,
    'Description détaillée :',
    listing.detailedDescription,
    `Hashtags : ${listing.hashtags.join(' ')}`,
    `Prix conseillé : ${formatPriceRange(listing)}`,
  ].join('\n\n')

export const formatSavedDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
