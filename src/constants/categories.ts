import { CategoryDefinition } from '../types';

export const EXPENSE_CATEGORIES: CategoryDefinition[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', bgColor: '#ffedd5' },
  { id: 'transport', name: 'การเดินทาง / ยานพาหนะ', type: 'expense', icon: 'Car', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'shopping', name: 'ช้อปปิ้ง / ของใช้', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'bills', name: 'บิล / ค่าน้ำค่าไฟ / ที่พัก', type: 'expense', icon: 'Home', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'entertainment', name: 'ความบันเทิง / พักผ่อน', type: 'expense', icon: 'Gamepad2', color: '#06b6d4', bgColor: '#cffafe' },
  { id: 'health', name: 'สุขภาพ / ยา / รักษา', type: 'expense', icon: 'HeartPulse', color: '#ef4444', bgColor: '#fee2e2' },
  { id: 'education', name: 'การศึกษา / หนังสือ', type: 'expense', icon: 'BookOpen', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'family', name: 'ครอบครัว / สัตว์เลี้ยง', type: 'expense', icon: 'Users', color: '#f59e0b', bgColor: '#fef3c7' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#64748b', bgColor: '#f1f5f9' },
];

export const INCOME_CATEGORIES: CategoryDefinition[] = [
  { id: 'salary', name: 'เงินเดือน / ค่าจ้าง', type: 'income', icon: 'Briefcase', color: '#10b981', bgColor: '#d1fae5' },
  { id: 'bonus', name: 'โบนัส / ค่าล่วงเวลา', type: 'income', icon: 'Award', color: '#f59e0b', bgColor: '#fef3c7' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: 'Store', color: '#3b82f6', bgColor: '#dbeafe' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: '#8b5cf6', bgColor: '#ede9fe' },
  { id: 'invest', name: 'การลงทุน / ดอกเบี้ย / เงินปันผล', type: 'income', icon: 'TrendingUp', color: '#06b6d4', bgColor: '#cffafe' },
  { id: 'gift', name: 'ของขวัญ / ได้รับจากครอบครัว', type: 'income', icon: 'Gift', color: '#ec4899', bgColor: '#fce7f3' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'PlusCircle', color: '#64748b', bgColor: '#f1f5f9' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryInfo(name: string, type: 'income' | 'expense') {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = list.find((c) => c.name === name) || ALL_CATEGORIES.find((c) => c.name === name);
  if (found) return found;
  return {
    id: 'unknown',
    name,
    type,
    icon: type === 'income' ? 'TrendingUp' : 'Tag',
    color: type === 'income' ? '#10b981' : '#f97316',
    bgColor: type === 'income' ? '#d1fae5' : '#ffedd5',
  };
}
