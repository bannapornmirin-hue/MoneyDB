export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function formatCurrency(amount: number, showDecimals = false): string {
  const rounded = Number(amount) || 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(rounded);
}

export function formatAmountNumber(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Convert YYYY-MM to Thai string e.g. "กันยายน 2569"
export function formatThaiMonthYear(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [yearStr, mStr] = monthStr.split('-');
  const monthIdx = parseInt(mStr, 10) - 1;
  const yearCE = parseInt(yearStr, 10);
  const yearBE = yearCE + 543;
  const monthName = THAI_MONTHS[monthIdx] || mStr;
  return `${monthName} ${yearBE}`;
}

// Format YYYY-MM-DD to "7 ก.ย. 2569"
export function formatThaiDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [yearStr, mStr, dayStr] = dateStr.split('-');
  const day = parseInt(dayStr, 10);
  const monthIdx = parseInt(mStr, 10) - 1;
  const yearCE = parseInt(yearStr, 10);
  const yearBE = yearCE + 543;
  const monthShort = THAI_MONTHS_SHORT[monthIdx] || mStr;
  return `${day} ${monthShort} ${yearBE}`;
}

export function getCurrentMonthStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function getTodayDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getAdjacentMonth(monthStr: string, delta: number): string {
  const [yearStr, mStr] = monthStr.split('-');
  let y = parseInt(yearStr, 10);
  let m = parseInt(mStr, 10) - 1 + delta;
  while (m < 0) {
    m += 12;
    y -= 1;
  }
  while (m > 11) {
    m -= 12;
    y += 1;
  }
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}
