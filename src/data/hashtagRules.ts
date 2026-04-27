export const hashtagRuleMap = {
  category: {
    'robes-jupes': ['robe', 'jupestyle', 'dressing'],
    'tops-chemises': ['top', 'lookfacile', 'chemise'],
    'jeans-pantalons': ['jean', 'basique', 'lookdujour'],
    'vestes-manteaux': ['veste', 'layering', 'misaison'],
    chaussures: ['chaussures', 'shoestyle', 'dressingshoes'],
    sacs: ['sac', 'bagseller', 'lookcomplet'],
    accessoires: ['accessoire', 'detailstyle', 'finition'],
    objets: ['deco', 'secondevie', 'petittrouvailles'],
  },
  season: {
    printemps: ['printemps', 'douceur'],
    ete: ['ete', 'soleil'],
    automne: ['automne', 'superposition'],
    hiver: ['hiver', 'cocooning'],
    'toute-saison': ['toutesaison', 'intemporel'],
  },
  style: {
    casual: ['casualstyle', 'easywear'],
    minimaliste: ['minimaliste', 'capsulewardrobe'],
    boheme: ['boheme', 'lookleger'],
    streetwear: ['streetwear', 'lookurbain'],
    chic: ['chic', 'elegant'],
    sport: ['sportwear', 'confort'],
    vintage: ['vintage', 'retrolook'],
  },
} as const

export const defaultHashtags = ['vintedfr', 'modeoccasion', 'secondevie']
