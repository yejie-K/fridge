
export enum Category {
  MEAT = '肉类',
  VEGETABLE = '蔬菜',
  FRUIT = '水果',
  SEAFOOD = '海鲜',
  OTHER = '其他'
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: Category;
  addedDate: string; // ISO date string
  isDeleted?: boolean; // Trash flag
}

export interface Recipe {
  name: string;
  difficulty: string;
  time: string;
  ingredientsUsed: string[];
  instructions: string[];
}
