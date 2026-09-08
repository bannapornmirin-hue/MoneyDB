import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Gamepad2,
  HeartPulse,
  BookOpen,
  Users,
  MoreHorizontal,
  Briefcase,
  Award,
  Store,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  Tag,
  Wallet,
  CreditCard,
  QrCode,
  Coins,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  color,
}) => {
  const props = { className, size, style: color ? { color } : undefined };

  switch (name) {
    case 'Utensils':
      return <Utensils {...props} />;
    case 'Car':
      return <Car {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Home':
      return <Home {...props} />;
    case 'Gamepad2':
      return <Gamepad2 {...props} />;
    case 'HeartPulse':
      return <HeartPulse {...props} />;
    case 'BookOpen':
      return <BookOpen {...props} />;
    case 'Users':
      return <Users {...props} />;
    case 'Briefcase':
      return <Briefcase {...props} />;
    case 'Award':
      return <Award {...props} />;
    case 'Store':
      return <Store {...props} />;
    case 'Laptop':
      return <Laptop {...props} />;
    case 'TrendingUp':
      return <TrendingUp {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'PlusCircle':
      return <PlusCircle {...props} />;
    case 'Wallet':
      return <Wallet {...props} />;
    case 'CreditCard':
      return <CreditCard {...props} />;
    case 'QrCode':
      return <QrCode {...props} />;
    case 'Coins':
      return <Coins {...props} />;
    case 'MoreHorizontal':
      return <MoreHorizontal {...props} />;
    default:
      return <Tag {...props} />;
  }
};
