import type { PostContentBlock } from '@/types/api';

export function countProductCards(blocks: PostContentBlock[]): number {
  return blocks.filter((b) => b.type === 'product_card').length;
}
