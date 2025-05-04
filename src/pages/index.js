import React from 'react';
import Link from 'next/link';
import { 
  BeakerIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Crop Identifier',
    description: 'Identify crops and get detailed information',
    icon: MagnifyingGlassIcon,
    href: '/identify',
  },
  {
    name: 'Financial Tools',
    description: 'Manage your farm finances and access government schemes',
    icon: BanknotesIcon,
    href: '/finance',
  },
  {
    name: 'Community',
    description: 'Connect with other farmers and share experiences',
    icon: UserGroupIcon,
    href: '/community',
  },
  {
    name: 'Marketplace',
    description: 'Buy and sell agricultural products',
    icon: ShoppingCartIcon,
    href: '/sell',
  },
];

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to KrushiMind
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Your AI-powered farming assistant for smarter agriculture
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Link href={feature.href} key={feature.name}>
            <div className="card hover:shadow-xl transition-shadow duration-200 cursor-pointer h-full">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
              <p className="mt-2 text-base text-gray-500">{feature.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;