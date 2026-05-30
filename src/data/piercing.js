// Structural piercing data. All display copy (labels, examples, guide text,
// quality items, prices intro) is provided per language by t.piercing.*.

export const GENERAL_PIERCING_ID = '__piercing_general__';

export function buildGeneralPiercingRequest(t) {
  return {
    id: GENERAL_PIERCING_ID,
    title: t.piercing.generalRequest.title,
    desc: t.piercing.generalRequest.desc,
    price: null,
  };
}

export const PIERCING_CATEGORY_IDS = ['ohr', 'nase', 'mund', 'gesicht', 'koerper'];

export const PIERCING_GUIDE_LAYOUT = [
  { id: 'face', src: '/piercing-guide-face.jpg', aspect: '1 / 1' },
  { id: 'ear',  src: '/piercing-guide-ear.jpg',  aspect: '3 / 4' },
];
