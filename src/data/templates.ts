import type {
  ListingObjective,
  ListingStatus,
  ProductCondition,
  ProductFormData,
} from '../types/listing'

export const initialProductFormData: ProductFormData = {
  typeArticle: '',
  marque: '',
  taille: '',
  couleur: '',
  etat: '',
  defaut: '',
  prix: '',
  categorie: '',
  saison: '',
  style: '',
  objectif: 'fast-sale',
  matiere: '',
}

export const categoryOptions = [
  { value: 'robes-jupes', label: 'Robes & jupes' },
  { value: 'tops-chemises', label: 'Tops & chemises' },
  { value: 'jeans-pantalons', label: 'Jeans & pantalons' },
  { value: 'vestes-manteaux', label: 'Vestes & manteaux' },
  { value: 'chaussures', label: 'Chaussures' },
  { value: 'sacs', label: 'Sacs' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'objets', label: 'Objets & déco' },
]

export const conditionOptions: Array<{
  value: ProductCondition
  label: string
}> = [
  { value: 'new-with-tags', label: 'Neuf avec étiquette' },
  { value: 'very-good', label: 'Très bon état' },
  { value: 'good', label: 'Bon état' },
  { value: 'correct', label: 'État correct' },
]

export const seasonOptions = [
  { value: 'printemps', label: 'Printemps' },
  { value: 'ete', label: 'Été' },
  { value: 'automne', label: 'Automne' },
  { value: 'hiver', label: 'Hiver' },
  { value: 'toute-saison', label: 'Toute saison' },
]

export const styleOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'minimaliste', label: 'Minimaliste' },
  { value: 'boheme', label: 'Boheme' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'chic', label: 'Chic' },
  { value: 'sport', label: 'Sport' },
  { value: 'vintage', label: 'Vintage' },
]

export const objectiveOptions: Array<{
  value: ListingObjective
  label: string
  helper: string
}> = [
  {
    value: 'fast-sale',
    label: 'Vendre vite',
    helper: 'Texte court, rassurant, avec un prix conseillé accessible.',
  },
  {
    value: 'best-price',
    label: 'Meilleur prix',
    helper: 'Annonce plus valorisante, avec un positionnement équilibré.',
  },
  {
    value: 'neutral',
    label: 'Ton neutre',
    helper: 'Annonce simple, claire, directe.',
  },
  {
    value: 'premium',
    label: 'Ton premium',
    helper: 'Présentation plus soignée, plus désirable.',
  },
]

export const statusOptions: Array<{
  value: ListingStatus
  label: string
}> = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'sold', label: 'Vendu' },
]

export const categoryLabels: Record<string, string> = Object.fromEntries(
  categoryOptions.map((option) => [option.value, option.label]),
)

export const seasonLabels: Record<string, string> = Object.fromEntries(
  seasonOptions.map((option) => [option.value, option.label]),
)

export const styleLabels: Record<string, string> = Object.fromEntries(
  styleOptions.map((option) => [option.value, option.label]),
)

export const conditionLabels: Record<ProductCondition, string> = {
  'new-with-tags': 'Neuf avec étiquette',
  'very-good': 'Très bon état',
  good: 'Bon état',
  correct: 'État correct',
}

export const pricePositioningLabels = {
  'fast-sale': 'Vente rapide',
  balanced: 'Équilibré',
  ambitious: 'Ambitieux',
} as const

export const objectiveToneGuides: Record<
  ListingObjective,
  {
    titleAccent: string
    shortLead: string
    detailLead: string
    closing: string
  }
> = {
  'fast-sale': {
    titleAccent: 'à saisir',
    shortLead: 'Annonce pensée pour rassurer et faire gagner du temps.',
    detailLead:
      "Annonce orientée vente rapide, avec des infos simples et utiles.",
    closing: 'Pièce facile à acheter, sans mauvaise surprise.',
  },
  'best-price': {
    titleAccent: 'bon rapport qualité-prix',
    shortLead: 'Le texte met en avant la valeur du produit sans en faire trop.',
    detailLead:
      "Annonce pensée pour convaincre sur la qualité, la transparence et le juste prix.",
    closing: 'Idéal pour valoriser la pièce sans surjouer.',
  },
  neutral: {
    titleAccent: 'annonce claire',
    shortLead: 'Description sobre, précise et facile à relire.',
    detailLead:
      'Ton neutre pour donner les bons détails sans surcharge.',
    closing: 'Tout est indiqué simplement pour aider à décider vite.',
  },
  premium: {
    titleAccent: 'belle pièce',
    shortLead: 'Présentation plus soignée pour une annonce élégante et rassurante.',
    detailLead:
      'Le ton valorise davantage la pièce, tout en restant honnête.',
    closing: 'Une annonce plus premium, sans masquer la réalité.',
  },
}

export const categoryPhotoTips: Record<string, string[]> = {
  'robes-jupes': [
    'Photographier la pièce bien droite pour montrer la coupe.',
    'Ajouter un plan détaillé des manches, de la taille ou de la longueur.',
  ],
  'tops-chemises': [
    'Montrer le col, les boutons et le tissu de près.',
    'Faire une photo à plat si la coupe est difficile à lire suspendue.',
  ],
  'jeans-pantalons': [
    'Bien cadrer la taille, les jambes et l’ourlet.',
    'Ajouter un zoom sur la matière et l’état des poches.',
  ],
  'vestes-manteaux': [
    'Prendre une photo face et une photo dos en lumière naturelle.',
    'Montrer la doublure, la fermeture et les poches de près.',
  ],
  chaussures: [
    'Faire une photo de profil, une de dessus et une des semelles.',
    'Montrer clairement l’usure éventuelle des talons ou des pointes.',
  ],
  sacs: [
    'Montrer le devant, le dos, l’intérieur et les anses.',
    'Ajouter un plan détaillé des coins et de la fermeture.',
  ],
  accessoires: [
    'Utiliser un fond sobre pour mettre en valeur la forme et la couleur.',
    'Ajouter un gros plan sur les finitions ou le fermoir.',
  ],
  objets: [
    'Prévoir une photo d’ensemble puis une photo détaillée des finitions.',
    'Ajouter une photo de l’objet en situation si cela aide à se projeter.',
  ],
}

export const publicationChecklistBase = [
  'Vérifier que la catégorie choisie correspond bien à l’article.',
  'Relire le titre pour garder uniquement les infos utiles.',
  'S’assurer que le prix affiché reste cohérent avec l’état du produit.',
  'Ajouter au moins cinq photos lumineuses et nettes.',
]

export const closingSignature = 'Prix négociable, envoi rapide et soigné.'
