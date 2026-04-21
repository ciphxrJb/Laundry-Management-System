'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { api } from '../lib/api';

interface Shop {
  id: string;
  name: string;
  organization: {
    id: string;
    name: string;
  };
}

interface ShopSwitcherProps {
  currentShopId?: string;
  onShopChange?: (shopId: string) => void;
}

export function ShopSwitcher({ currentShopId, onShopChange }: ShopSwitcherProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const userShops = await api.getUserShops();
        const formattedShops: Shop[] = userShops.map(item => ({
          id: item.shops.id,
          name: item.shops.name,
          organization: {
            id: item.shops.organizations.id,
            name: item.shops.organizations.name,
          }
        }));
        setShops(formattedShops);

        // Set current shop based on currentShopId or first shop
        const activeShop = formattedShops.find(s => s.id === currentShopId) || formattedShops[0];
        setCurrentShop(activeShop);
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [currentShopId]);

  const handleShopSelect = (shop: Shop) => {
    setCurrentShop(shop);
    onShopChange?.(shop.id);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg animate-pulse">
        <Building2 size={16} className="text-slate-400" />
        <div className="h-4 bg-slate-200 rounded w-20"></div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-500 text-sm">
        <Building2 size={16} />
        No shops assigned
      </div>
    );
  }

  if (shops.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-slate-700 text-sm font-medium">
        <Building2 size={16} />
        <span className="truncate">{currentShop?.name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-8 px-3 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-medium text-sm justify-between min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={14} />
            <span className="truncate">{currentShop?.name}</span>
          </div>
          <ChevronDown size={14} className="ml-2 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {shops.map((shop) => (
          <DropdownMenuItem
            key={shop.id}
            onClick={() => handleShopSelect(shop)}
            className={`cursor-pointer ${
              shop.id === currentShop?.id ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            <div className="flex flex-col">
              <span className="font-medium">{shop.name}</span>
              <span className="text-xs text-slate-500">{shop.organization.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}