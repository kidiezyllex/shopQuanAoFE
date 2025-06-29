'use client';

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@mdi/react';
import {
  mdiMagnify,
  mdiPlus,
  mdiMinus,
  mdiDelete,
  mdiCashRegister,
  mdiTag,
  mdiCashMultiple,
  mdiInformationOutline,
  mdiReceipt,
  mdiClock,
  mdiAccount,
  mdiContentCopy,
  mdiPrinter,
  mdiChevronLeft,
  mdiPalette,
  mdiCheck,
  mdiRuler,
  mdiCurrencyUsd,
  mdiPackageVariant,
  mdiCartPlus,
  mdiBarcode,
  mdiInvoicePlus,
  mdiClose,
  mdiCart,
  mdiChevronDown,
  mdiViewGridOutline,
  mdiTableLarge,
  mdiEye,
  mdiBankTransfer
} from '@mdi/js';
import { checkImageUrl, cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { useVouchers, useIncrementVoucherUsage } from '@/hooks/voucher';
import { getAllVouchers } from '@/api/voucher';
import { useProducts, useSearchProducts } from '@/hooks/product';
import { usePromotions } from '@/hooks/promotion';
import { applyPromotionsToProducts, filterActivePromotions } from '@/lib/promotions';
import { IProductFilter } from '@/interface/request/product';
import { usePosStore } from '@/stores/posStore';
import { useCreatePOSOrder } from '@/hooks/order';
import { IPOSOrderCreateRequest } from '@/interface/request/order';
import { usePOSCartStore, POSCartItem } from '@/stores/usePOSCartStore';
import { usePendingCartsStore, PendingCart } from '@/stores/usePendingCartsStore';
import { useAccounts } from '@/hooks/account';
import { IAccount } from '@/interface/response/account';
import { getSizeLabel } from '@/utils/sizeMapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import VouchersDialog from './components/VouchersDialog';
import InvoiceDialog from './components/InvoiceDialog';
// QR Code Component
const QRCodeComponent = ({ value, size = 200 }: { value: string; size?: number }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <img
      src={qrCodeUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="border border-gray-200 rounded"
    />
  );
};

// Card Skeleton Component
const CardSkeleton = () => (
  <div className="bg-white rounded-[6px] border border-border shadow-sm overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-2" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex -space-x-1">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-8 w-full mt-3" />
    </div>
  </div>
);

interface ApiVariant {
  id: string;
  colorId?: { id: string; name: string; code: string; images?: string[] };
  sizeId?: { id: string; name: string; value?: string; };
  price: number;
  stock: number;
  images?: string[];
  sku?: string;
  actualSizeId?: string;
}

interface ApiProduct {
  id: string;
  name: string;
  brand: { id: string; name: string; } | string;
  category: { id: string; name: string; } | string;
  description?: string;
  variants: ApiVariant[];
  status?: string;
  createdAt: string;
}
interface InvoiceShopInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface InvoiceCustomerInfo {
  name: string;
  phone: string;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  color: string;
  size: string;
}

interface InvoiceData {
  shopInfo: InvoiceShopInfo;
  customerInfo: InvoiceCustomerInfo;
  orderId: string;
  employee: string;
  createdAt: string;
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  voucherCode?: string;
  total: number;
  cashReceived: number;
  changeGiven: number;
  paymentMethod: string;
}


// Fix the image URL extraction for variants
const getVariantImageUrl = (variant: any) => {
  if (!variant?.images || !Array.isArray(variant.images) || variant.images.length === 0) {
    return '/images/white-image.png';
  }

  // Handle both string arrays and object arrays
  const firstImage = variant.images[0];
  if (typeof firstImage === 'string') {
    return firstImage;
  } else if (typeof firstImage === 'object' && firstImage?.imageUrl) {
    return firstImage.imageUrl;
  } else if (typeof firstImage === 'object' && firstImage?.url) {
    return firstImage.url;
  }

  return '/images/white-image.png';
};

// Convert API variant to ApiVariant interface
const convertVariantToApiVariant = (variant: any): ApiVariant => {
  // Handle case where variant might be null or undefined
  if (!variant) {
    return {
      id: '',
      price: 0,
      stock: 0,
      images: []
    };
  }

  // Handle color data - check for populated vs non-populated
  let colorData = undefined;
  if (variant.color) {
    // Populated format
    colorData = {
      id: variant.color.id?.toString() || '',
      name: variant.color.name || 'N/A',
      code: variant.color.code || '#000000',
      images: variant.color.images || []
    };
  } else if (variant.colorId) {
    // Non-populated format - colorId might be string or object
    if (typeof variant.colorId === 'object') {
      colorData = {
        id: variant.colorId.id?.toString() || '',
        name: variant.colorId.name || 'N/A',
        code: variant.colorId.code || '#000000',
        images: variant.colorId.images || []
      };
    } else {
      colorData = {
        id: variant.colorId.toString(),
        name: 'N/A',
        code: '#000000',
        images: []
      };
    }
  }

  // Handle size data - check for populated vs non-populated
  let sizeData = undefined;
  if (variant.size) {
    // Populated format
    sizeData = {
      id: variant.size.id?.toString() || '',
      name: variant.size.name || (variant.size.value ? getSizeLabel(Number(variant.size.value)) : 'N/A'),
      value: variant.size.value?.toString()
    };
  } else if (variant.sizeId) {
    // Non-populated format - sizeId might be string or object
    if (typeof variant.sizeId === 'object') {
      sizeData = {
        id: variant.sizeId.id?.toString() || '',
        name: variant.sizeId.name || (variant.sizeId.value ? getSizeLabel(Number(variant.sizeId.value)) : 'N/A'),
        value: variant.sizeId.value?.toString()
      };
    } else {
      sizeData = {
        id: variant.sizeId.toString(),
        name: 'N/A',
        value: undefined
      };
    }
  }

  return {
    id: variant.id?.toString() || variant._id?.toString() || '',
    colorId: colorData,
    sizeId: sizeData,
    price: parseFloat(variant.price?.toString() || '0'),
    stock: parseInt(variant.stock?.toString() || '0'),
    images: variant.images?.map((img: any) => typeof img === 'string' ? img : img.imageUrl || img.url) || [],
    sku: variant.sku || '',
    actualSizeId: sizeData?.id || ''
  };
};

// Convert API product to ApiProduct interface
const convertProductToApiProduct = (product: any): ApiProduct => {
  if (!product) {
    return {
      id: '',
      name: 'Unknown Product',
      brand: 'Unknown',
      category: 'Unknown',
      variants: [],
      createdAt: new Date().toISOString()
    };
  }

  return {
    id: product.id?.toString() || product._id?.toString() || '',
    name: product.name || 'Unknown Product',
    brand: product.brand || 'Unknown',
    category: product.category || 'Unknown',
    description: product.description,
    variants: product.variants?.map(convertVariantToApiVariant) || [],
    status: product.status,
    createdAt: product.createdAt || new Date().toISOString()
  };
};

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null);
  const [selectedApiVariant, setSelectedApiVariant] = useState<ApiVariant | null>(null);

  // Pending carts store
  const {
    carts: pendingCarts,
    activeCartId,
    createNewCart,
    deleteCart,
    setActiveCart,
    addItemToCart: addItemToPendingCart,
    removeItemFromCart: removeItemFromPendingCart,
    updateItemQuantityInCart: updateItemQuantityInPendingCart,
    clearCartItems: clearPendingCartItems,
    setCartDiscount: setPendingCartDiscount,
    getActiveCart,
  } = usePendingCartsStore();

  const activeCart = getActiveCart();
  const cartItems = activeCart?.items || [];
  console.log(cartItems)
  const appliedDiscount = activeCart?.appliedDiscount || 0;
  const appliedVoucher = activeCart?.appliedVoucher || null;
  const couponCode = activeCart?.couponCode || '';

  const {
    items: mainCartItems,
    appliedDiscount: mainAppliedDiscount,
    appliedVoucher: mainAppliedVoucher,
    couponCode: mainCouponCode,
    addToCart: addToCartStore,
    removeFromCart: removeFromCartStore,
    updateQuantity: updateQuantityStore,
    clearCart: clearCartStore,
    setDiscount,
    setVoucher,
    setCouponCode,
    calculateSubtotal,
    calculateTotal
  } = usePOSCartStore();

  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [showCheckoutDialog, setShowCheckoutDialog] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('guest');
  const [checkoutIsLoading, setCheckoutIsLoading] = useState<boolean>(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState<boolean>(false);
  const [transferPaymentCompleted, setTransferPaymentCompleted] = useState<boolean>(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 6 });
  const [filters, setFilters] = useState<IProductFilter>({ status: 'HOAT_DONG' });
  const [sortOption, setSortOption] = useState<string>('newest');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [activeCategoryName, setActiveCategoryName] = useState<string>('Tất cả sản phẩm');
  const [showVouchersDialog, setShowVouchersDialog] = useState<boolean>(false);

  const [cashReceived, setCashReceived] = useState<number | string>('');
  const [showInvoiceDialog, setShowInvoiceDialog] = useState<boolean>(false);
  const [currentInvoiceData, setCurrentInvoiceData] = useState<InvoiceData | null>(null);
  const [showDeleteCartDialog, setShowDeleteCartDialog] = useState<boolean>(false);
  const [cartToDelete, setCartToDelete] = useState<string | null>(null);
  const [showCartItemsDialog, setShowCartItemsDialog] = useState<boolean>(false);
  const [selectedCartForView, setSelectedCartForView] = useState<string | null>(null);

  const stats = usePosStore((state) => state.stats);
  const updateStatsOnCheckout = usePosStore((state) => state.updateStatsOnCheckout);
  const createOrderMutation = useCreatePOSOrder();

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 'TX-1234', customer: 'Nguyễn Văn A', amount: 1250000, time: '10:25', status: 'completed' },
    { id: 'TX-1233', customer: 'Trần Thị B', amount: 850000, time: '09:40', status: 'completed' },
    { id: 'TX-1232', customer: 'Lê Văn C', amount: 2100000, time: '09:15', status: 'pending' }
  ]);

  const { mutate: incrementVoucherUsageMutation } = useIncrementVoucherUsage();

  const accountsParams = useMemo(() => ({
    role: 'CUSTOMER' as const,
    status: 'HOAT_DONG' as const,
    limit: 100
  }), []);

  const { data: usersData, isLoading: isLoadingUsers } = useAccounts(accountsParams);

  // Debounced search with better performance
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsSearching(searchQuery.trim().length > 0);
    }, 300); // Reduce from 500ms to 300ms for better UX

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Optimize category filter effect
  useEffect(() => {
    setFilters(prevFilters => {
      const isAllProducts = activeCategoryName === 'Tất cả sản phẩm';

      if (isAllProducts) {
        // Remove categories filter if "All products" is selected
        const { categories, ...restFilters } = prevFilters;
        return categories ? restFilters : prevFilters;
      } else {
        // Add/update categories filter
        const newCategories = [activeCategoryName];
        if (prevFilters.categories?.[0] === activeCategoryName) {
          return prevFilters; // No change needed
        }
        return { ...prevFilters, categories: newCategories };
      }
    });

    // Reset pagination only when actually changing category
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [activeCategoryName]);

  // Optimize pagination params with stable reference
  const productsHookParams: IProductFilter = useMemo(() => ({
    ...pagination,
    ...filters,
  }), [pagination.page, pagination.limit, filters.status, filters.categories]);

  const productsQuery = useProducts(productsHookParams);

  // Optimize search params with stable reference
  const searchQueryParams = useMemo(() => {
    if (!isSearching) return { keyword: '' };
    return {
      keyword: searchQuery,
      status: 'HOAT_DONG' as const,
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.categories && { categories: filters.categories })
    };
  }, [isSearching, searchQuery, pagination.page, pagination.limit, filters.categories]);

  const searchQueryHook = useSearchProducts(searchQueryParams);

  const {
    data: rawData,
    isLoading: apiIsLoading,
    isError: apiIsError,
  } = isSearching ? searchQueryHook : productsQuery;

  // Get promotions data with stable params
  const promotionsParams = useMemo(() => ({ status: 'ACTIVE' as const }), []);
  const { data: promotionsData } = usePromotions(promotionsParams);
  // Optimize promotions application - only when data changes
  const dataWithPromotions = useMemo(() => {
    if (!rawData?.data?.products) return rawData;

    let products = rawData.data.products;

    if (promotionsData?.data?.promotions?.length > 0) {
      const activePromotions = filterActivePromotions(promotionsData.data.promotions);
      products = applyPromotionsToProducts([...products], activePromotions);
    }

    return {
      ...rawData,
      data: {
        ...rawData.data,
        products,
      },
    };
  }, [rawData?.data?.products, promotionsData?.data?.promotions]);

  // Optimize product sorting with early return
  const processedProducts = useMemo(() => {
    const products = dataWithPromotions?.data?.products;
    if (!products?.length) return [];

    // Return early if no sorting needed
    if (sortOption === 'default' || sortOption === 'newest') {
      return products;
    }

    // Only sort if explicitly needed
    return [...products].sort((a, b) => {
      const priceA = (a as any).hasDiscount ? (a as any).discountedPrice : (a.variants[0]?.price || 0);
      const priceB = (b as any).hasDiscount ? (b as any).discountedPrice : (b.variants[0]?.price || 0);

      switch (sortOption) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        default:
          return 0;
      }
    });
  }, [dataWithPromotions?.data?.products, sortOption]);

  // Optimize categories calculation - only when products change
  const dynamicCategories = useMemo(() => {
    const baseCategories = [{ id: 'all', name: 'Tất cả sản phẩm' }];
    const products = dataWithPromotions?.data?.products;

    if (!products?.length) return baseCategories;

    const uniqueCatObjects = new Map<string, { id: string; name: string }>();

    for (const product of products) {
      if (product.category && typeof product.category === 'object' && (product.category as any).id && product.category.name) {
        if (!uniqueCatObjects.has((product.category as any).id)) {
          uniqueCatObjects.set((product.category as any).id, { id: (product.category as any).id, name: product.category.name });
        }
      } else if (typeof product.category === 'string' && !uniqueCatObjects.has(product.category)) {
        uniqueCatObjects.set(product.category, { id: product.category, name: product.category });
      }
    }

    return [...baseCategories, ...Array.from(uniqueCatObjects.values())];
  }, [dataWithPromotions?.data?.products?.length]);

  const handleProductSelect = (product: any) => {
    // Keep the product with promotion info intact
    const productWithPromotion = { ...product };
    
    // Convert only for variant handling, but preserve promotion info
    const convertedProduct = convertProductToApiProduct(product);
    
    // Merge promotion info back to the converted product
    if ((product as any).hasDiscount) {
      (convertedProduct as any).hasDiscount = (product as any).hasDiscount;
      (convertedProduct as any).discountedPrice = (product as any).discountedPrice;
      (convertedProduct as any).originalPrice = (product as any).originalPrice;
      (convertedProduct as any).discountPercent = (product as any).discountPercent;
      (convertedProduct as any).appliedPromotion = (product as any).appliedPromotion;
      
      console.log('Product selected with promotion:', {
        name: convertedProduct.name,
        originalPrice: (convertedProduct as any).originalPrice,
        discountedPrice: (convertedProduct as any).discountedPrice,
        discountPercent: (convertedProduct as any).discountPercent
      });
    }
    
    setSelectedProduct(convertedProduct);
    
    if (convertedProduct.variants && convertedProduct.variants.length > 0) {
      // Prioritize variants with stock, but still allow selection of out-of-stock variants
      const variantWithStock = convertedProduct.variants.find(v => v.stock > 0);
      const selectedVariant = variantWithStock || convertedProduct.variants[0];
      setSelectedApiVariant(selectedVariant);

      if (!variantWithStock) {
        toast.warn('Sản phẩm này hiện tại đã hết hàng.');
      }
    } else {
      setSelectedApiVariant(null);
      toast.warn('Sản phẩm này không có biến thể.');
    }
  };

  const handleColorSelectFromDetail = (colorId: string) => {
    if (!selectedProduct) return;

    // Find variants with the selected color
    const variantsWithThisColor = selectedProduct.variants.filter(v => v.colorId?.id === colorId);
    if (variantsWithThisColor.length === 0) return;

    // Try to find a variant with stock first
    const variantWithStock = variantsWithThisColor.find(v => v.stock > 0);
    if (variantWithStock) {
      setSelectedApiVariant(variantWithStock);
    } else {
      // If no variants with stock, select the first one
      setSelectedApiVariant(variantsWithThisColor[0]);
      toast.warn("Màu này đã hết hàng.");
    }
  };

  const handleSizeSelectFromDetail = (sizeId: string) => {
    if (!selectedProduct || !selectedApiVariant?.colorId) return;

    // Find variant with selected color and size
    const variantWithThisSizeAndColor = selectedProduct.variants.find(v =>
      v.colorId?.id === selectedApiVariant.colorId?.id && v.sizeId?.id === sizeId
    );

    if (variantWithThisSizeAndColor) {
      setSelectedApiVariant(variantWithThisSizeAndColor);
      if (variantWithThisSizeAndColor.stock === 0) {
        toast.warn("Kích thước này với màu đã chọn đã hết hàng.");
      }
    }
  };

  // Helper function to add item to the correct cart (pending or main)
  const addItemToCorrectCart = (product: any, variant: any, isAlreadyConverted = false) => {
    // Always ensure proper conversion unless explicitly told variant is already converted
    const convertedProduct = isAlreadyConverted ? product : convertProductToApiProduct(product);
    const convertedVariant = isAlreadyConverted ? variant : convertVariantToApiVariant(variant);



    const cartItemId = `${convertedProduct.id}-${convertedVariant.id}`;
    
    // Apply promotions to get the correct price
    let finalPrice = convertedVariant.price;
    let originalPrice = undefined;
    let discountPercent = undefined;
    let hasDiscount = false;

    // Check if product already has discount applied (from product list)
    if ((product as any).hasDiscount) {
      finalPrice = (product as any).discountedPrice;
      originalPrice = (product as any).originalPrice;
      discountPercent = (product as any).discountPercent;
      hasDiscount = true;
    } else if (promotionsData?.data?.promotions?.length > 0) {
      // Apply promotions if not already applied
      const activePromotions = filterActivePromotions(promotionsData.data.promotions);
      const productWithPromotions = applyPromotionsToProducts([convertedProduct], activePromotions);
      const promotedProduct = productWithPromotions[0];
      
      if (promotedProduct?.hasDiscount) {
        finalPrice = promotedProduct.discountedPrice;
        originalPrice = promotedProduct.originalPrice;
        discountPercent = promotedProduct.discountPercent;
        hasDiscount = true;
        // Optional: Add success notification for promotion
        console.log(`Promotion applied: ${discountPercent}% off on ${convertedProduct.name}`);
      }
    }

    const newItem: POSCartItem = {
      id: cartItemId,
      productId: convertedProduct.id,
      variantId: convertedVariant.id,
      name: convertedProduct.name,
      colorName: convertedVariant.colorId?.name || 'N/A',
      colorCode: convertedVariant.colorId?.code || '#000000',
      sizeName: convertedVariant.sizeId?.name || 'N/A',
      price: finalPrice,
      originalPrice: originalPrice,
      discountPercent: discountPercent,
      hasDiscount: hasDiscount,
      quantity: 1,
      image: getVariantImageUrl(convertedVariant) || '/placeholder.svg',
      stock: convertedVariant.stock,
      actualColorId: convertedVariant.colorId?.id || '',
      actualSizeId: convertedVariant.sizeId?.id || '',
    };

    if (activeCartId) {
      // Add to pending cart
      const existingItem = cartItems.find(item => item.id === cartItemId);
      const activeCartName = pendingCarts.find(cart => cart.id === activeCartId)?.name || 'Giỏ hàng';

      if (existingItem) {
        if (existingItem.quantity < convertedVariant.stock) {
          updateItemQuantityInPendingCart(activeCartId, cartItemId, 1);
          toast.success(`Đã cập nhật số lượng sản phẩm trong ${activeCartName}.`);
        } else {
          toast.warn('Số lượng sản phẩm trong kho không đủ.');
        }
      } else {
        addItemToPendingCart(activeCartId, newItem);
        toast.success(`Đã thêm sản phẩm vào ${activeCartName}`);
      }
    } else {
      // Fallback to main cart if no pending cart is active
      const existingItem = mainCartItems.find(item => item.id === cartItemId);
      if (existingItem) {
        if (existingItem.quantity < convertedVariant.stock) {
          updateQuantityStore(cartItemId, 1);
          toast.success('Đã cập nhật số lượng sản phẩm.');
        } else {
          toast.warn('Số lượng sản phẩm trong kho không đủ.');
        }
      } else {
        addToCartStore(newItem);
        toast.success('Đã thêm sản phẩm vào giỏ hàng');
      }
    }
  };

  const addToCart = () => {
    if (!selectedProduct || !selectedApiVariant) {
      toast.error('Vui lòng chọn sản phẩm, màu và kích thước.');
      return;
    }

    if (selectedApiVariant.stock === 0) {
      toast.error('Sản phẩm này đã hết hàng.');
      return;
    }

    // Use selectedProduct which already has promotion info preserved
    addItemToCorrectCart(selectedProduct, selectedApiVariant, false);

    setSelectedProduct(null);
    setSelectedApiVariant(null);
  };

  const updateCartItemQuantity = (id: string, amount: number) => {
    if (activeCartId) {
      const item = cartItems.find(item => item.id === id);
      if (!item) return;

      const newQuantity = item.quantity + amount;
      if (newQuantity <= 0) {
        removeItemFromPendingCart(activeCartId, id);
        return;
      }

      if (newQuantity > item.stock) {
        toast.warn(`Chỉ còn ${item.stock} sản phẩm trong kho.`);
        return;
      }

      updateItemQuantityInPendingCart(activeCartId, id, amount);

      // Check voucher validity after quantity update
      if (appliedVoucher) {
        const subtotal = calculateCartSubtotal();
        if (subtotal < parseFloat(appliedVoucher.minOrderValue)) {
          toast.warn(`Đơn hàng không còn đủ điều kiện cho mã "${appliedVoucher.code}". Đã xóa mã.`);
          setPendingCartDiscount(activeCartId, 0, null, '');
        } else {
          let newDiscountAmount = 0;
          if (appliedVoucher.type === 'PERCENTAGE') {
            newDiscountAmount = (subtotal * parseFloat(appliedVoucher.value)) / 100;
            if (appliedVoucher.maxDiscount && newDiscountAmount > parseFloat(appliedVoucher.maxDiscount)) {
              newDiscountAmount = parseFloat(appliedVoucher.maxDiscount);
            }
          } else if (appliedVoucher.type === 'FIXED_AMOUNT') {
            newDiscountAmount = parseFloat(appliedVoucher.value);
          }
          newDiscountAmount = Math.min(newDiscountAmount, subtotal);
          setPendingCartDiscount(activeCartId, newDiscountAmount, appliedVoucher, couponCode);
        }
      }
    } else {
      // Fallback to main cart
      const item = mainCartItems.find(item => item.id === id);
      if (!item) return;

      const newQuantity = item.quantity + amount;
      if (newQuantity <= 0) {
        removeFromCartStore(id);
        return;
      }

      if (newQuantity > item.stock) {
        toast.warn(`Chỉ còn ${item.stock} sản phẩm trong kho.`);
        return;
      }

      updateQuantityStore(id, amount);
    }
  };

  const removeCartItem = (id: string) => {
    if (activeCartId) {
      removeItemFromPendingCart(activeCartId, id);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');

      // Check voucher validity after item removal
      if (appliedVoucher) {
        const subtotal = calculateCartSubtotal();
        if (subtotal < parseFloat(appliedVoucher.minOrderValue) || cartItems.length <= 1) {
          toast.warn(`Đơn hàng không còn đủ điều kiện cho mã "${appliedVoucher.code}" hoặc giỏ hàng trống. Đã xóa mã.`);
          setPendingCartDiscount(activeCartId, 0, null, '');
        }
      }
    } else {
      removeFromCartStore(id);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    }
  };

  // New function to remove item from any specific cart
  const removeItemFromSpecificCart = (cartId: string, itemId: string) => {
    const cart = pendingCarts.find(c => c.id === cartId);
    if (!cart) return;

    removeItemFromPendingCart(cartId, itemId);
    toast.success(`Đã xóa sản phẩm khỏi ${cart.name}`);

    // Check voucher validity after item removal if this is the active cart
    if (cartId === activeCartId && appliedVoucher) {
      const subtotal = calculateCartSubtotal();
      if (subtotal < parseFloat(appliedVoucher.minOrderValue) || cartItems.length <= 1) {
        toast.warn(`Đơn hàng không còn đủ điều kiện cho mã "${appliedVoucher.code}" hoặc giỏ hàng trống. Đã xóa mã.`);
        setPendingCartDiscount(cartId, 0, null, '');
      }
    }
  };



  const applyCoupon = async () => {
    // Get the correct coupon code based on the current context
    const currentCouponCode = activeCartId ? (activeCart?.couponCode || '') : couponCode;
    
    if (!currentCouponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá.');
      return;
    }

    try {
      // Manually fetch voucher data with the current coupon code
      const voucherDataResult = await getAllVouchers({ 
        code: currentCouponCode, 
        status: 'HOAT_DONG', 
        limit: 1, 
        page: 1 
      });

            const voucher = voucherDataResult?.data?.vouchers?.[0];

      if (voucher) {
        const subtotal = calculateCartSubtotal();
        if (subtotal < parseFloat(voucher.minOrderValue.toString())) {
          toast.error(`Đơn hàng chưa đạt giá trị tối thiểu ${formatCurrency(parseFloat(voucher.minOrderValue.toString()))} để áp dụng mã này.`);
          if (activeCartId) {
            setPendingCartDiscount(activeCartId, 0, null, '');
          } else {
            setVoucher(null);
            setDiscount(0);
          }
          return;
        }

        if (voucher.quantity <= voucher.usedCount) {
          toast.error('Mã giảm giá này đã hết lượt sử dụng.');
          if (activeCartId) {
            setPendingCartDiscount(activeCartId, 0, null, '');
          } else {
            setVoucher(null);
            setDiscount(0);
          }
          return;
        }

        if (new Date(voucher.endDate) < new Date()) {
          toast.error('Mã giảm giá đã hết hạn.');
          if (activeCartId) {
            setPendingCartDiscount(activeCartId, 0, null, '');
          } else {
            setVoucher(null);
            setDiscount(0);
          }
          return;
        }

        let discountAmount = 0;
        if (voucher.type === 'PERCENTAGE') {
          discountAmount = (subtotal * parseFloat(voucher.value.toString())) / 100;
          if (voucher.maxDiscount && discountAmount > parseFloat(voucher.maxDiscount.toString())) {
            discountAmount = parseFloat(voucher.maxDiscount.toString());
          }
        } else if (voucher.type === 'FIXED_AMOUNT') {
          discountAmount = parseFloat(voucher.value.toString());
        }

        discountAmount = Math.min(discountAmount, subtotal);

        if (activeCartId) {
          setPendingCartDiscount(activeCartId, discountAmount, voucher, currentCouponCode);
        } else {
          setDiscount(discountAmount);
          setVoucher(voucher);
        }

        toast.success(`Đã áp dụng mã giảm giá "${voucher.code}".`);
      } else {
        toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
        if (activeCartId) {
          setPendingCartDiscount(activeCartId, 0, null, '');
        } else {
          setVoucher(null);
          setDiscount(0);
          setCouponCode('');
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tìm mã giảm giá.');
      if (activeCartId) {
        setPendingCartDiscount(activeCartId, 0, null, '');
      } else {
        setVoucher(null);
        setDiscount(0);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTimeForInvoice = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng đang trống');
      return;
    }
    const totalAmount = calculateCartTotal();
    const cashReceivedNum = parseFloat(cashReceived.toString());

    if (paymentMethod === 'cash' && (isNaN(cashReceivedNum) || cashReceivedNum < totalAmount)) {
      toast.error('Số tiền khách đưa không đủ hoặc không hợp lệ.');
      return;
    }


    setCheckoutIsLoading(true);

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const generatedOrderId = `POS${hours}${minutes}${seconds}`;

    const orderPayload: IPOSOrderCreateRequest = {
      orderId: generatedOrderId,
      customer: customerName || 'Khách tại quầy',
      items: cartItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
        variant: {
          colorId: item.actualColorId || '',
          sizeId: item.actualSizeId || '',
        }
      })),
      subTotal: calculateCartSubtotal(),
      total: totalAmount,
      shippingAddress: {
        name: customerName || 'Khách vãng lai',
        phoneNumber: customerPhone || 'N/A',
        provinceId: 'N/A',
        districtId: 'N/A',
        wardId: 'N/A',
        specificAddress: 'Tại quầy'
      },
      paymentMethod: paymentMethod === 'cash' ? 'CASH' : 'BANK_TRANSFER',
      orderStatus: "HOAN_THANH",
      discount: appliedDiscount,
      voucher: appliedVoucher?.id || '',
    };

    try {
      const orderResponse = await createOrderMutation.mutateAsync(orderPayload);

      if (orderResponse.success && orderResponse.data) {
        const orderCode = orderResponse.data.orderNumber || `POS-${Math.floor(1000 + Math.random() * 9000)}`;
        updateStatsOnCheckout(totalAmount);
        const newTransaction = {
          id: orderCode,
          customer: customerName || 'Khách vãng lai',
          amount: totalAmount,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          status: 'completed'
        };
        setRecentTransactions([newTransaction, ...recentTransactions.slice(0, 2)]);
        toast.success(`Đã tạo đơn hàng ${orderCode} và thanh toán thành công!`);

        if (appliedVoucher) {
          incrementVoucherUsageMutation(
            appliedVoucher.id,
            {
              onSuccess: () => {
                toast.info(`Đã cập nhật lượt sử dụng cho mã giảm giá "${appliedVoucher.code}".`);
              },
              onError: (error: Error) => {
                toast.error(`Lỗi khi cập nhật mã giảm giá: ${error.message}`);
              },
            }
          );
        }

        const currentChangeDue = paymentMethod === 'cash' && !isNaN(cashReceivedNum) && cashReceivedNum >= totalAmount ? cashReceivedNum - totalAmount : 0;
        const invoiceData: InvoiceData = {
          shopInfo: {
            name: 'Clothes Shop',
            address: 'Địa chỉ shop: 20 Hồ Tùng Mậu, Cầu Giấy, Hà Nội',
            phone: '0123 456 789',
            email: 'info@clothes.com'
          },
          customerInfo: {
            name: customerName || 'Khách vãng lai',
            phone: customerPhone || 'N/A',
          },
          orderId: orderCode,
          employee: 'Nhân viên Bán Hàng',
          createdAt: new Date().toISOString(),
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            color: item.colorName,
            size: item.sizeName,
          })),
          subTotal: calculateCartSubtotal(),
          discount: appliedDiscount,
          voucherCode: appliedVoucher?.code,
          total: totalAmount,
          cashReceived: paymentMethod === 'cash' ? cashReceivedNum : totalAmount,
          changeGiven: currentChangeDue,
          paymentMethod: paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
        };
        setCurrentInvoiceData(invoiceData);
        setShowInvoiceDialog(true);
        clearCartStore();
        if (activeCartId) {
          clearPendingCartItems(activeCartId);
        }
        setCustomerName('');
        setCustomerPhone('');
        setSelectedUserId('guest');
        setPaymentMethod('cash');
        setCashReceived('');
        setTransferPaymentCompleted(false);
        setShowCheckoutDialog(false);

      } else {
        toast.error((orderResponse as any).message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra trong quá trình thanh toán.');
    } finally {
      setCheckoutIsLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    const itemsToCheck = activeCart?.items || mainCartItems;
    if (itemsToCheck.length === 0) {
      toast.error('Giỏ hàng đang trống');
      return;
    }
    syncActiveCartToMainCart();
    setCashReceived('');
    setSelectedUserId('guest');
    setCustomerName('');
    setCustomerPhone('');
    setTransferPaymentCompleted(false);
    setShowCheckoutDialog(true);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    if (userId && userId !== 'guest' && userId !== 'loading' && userId !== 'no-customers' && usersData?.data?.accounts) {
      const selectedUser = usersData.data.accounts.find((user: IAccount) => user.id === userId);
      if (selectedUser) {
        setCustomerName(selectedUser.fullName);
        setCustomerPhone(selectedUser.phoneNumber || '');
      }
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'p') {
        handleProceedToCheckout();
      }

      if (e.altKey && e.key === 'c') {
        if (cartItems.length > 0 || appliedVoucher) {
          clearCartStore();
          if (activeCartId) {
            clearPendingCartItems(activeCartId);
          }
          setSelectedProduct(null);
          setSelectedApiVariant(null);
          toast.success('Đã xóa giỏ hàng và mã giảm giá.');
        }
      }

      if (e.altKey && e.key === 's') {
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, appliedVoucher, handleProceedToCheckout]);

  // Optimize variant calculations with memoization
  const uniqueColorsForSelectedProduct = useMemo(() => {
    if (!selectedProduct?.variants?.length) return [];
    const colorMap = new Map<string, ApiVariant['colorId']>();

    for (const variant of selectedProduct.variants) {
      if (variant.colorId?.id && !colorMap.has(variant.colorId.id)) {
        colorMap.set(variant.colorId.id, variant.colorId);
      }
    }

    return Array.from(colorMap.values()).filter(Boolean) as NonNullable<ApiVariant['colorId']>[];
  }, [selectedProduct?.id, selectedProduct?.variants?.length]);

  const availableSizesForSelectedColor = useMemo(() => {
    if (!selectedProduct?.variants?.length || !selectedApiVariant?.colorId?.id) return [];
    const sizeMap = new Map<string, ApiVariant['sizeId']>();

    for (const variant of selectedProduct.variants) {
      if (variant.colorId?.id === selectedApiVariant.colorId.id &&
        variant.sizeId?.id &&
        !sizeMap.has(variant.sizeId.id)) {
        sizeMap.set(variant.sizeId.id, variant.sizeId);
      }
    }

    return Array.from(sizeMap.values()).filter(Boolean) as NonNullable<ApiVariant['sizeId']>[];
  }, [selectedProduct?.id, selectedApiVariant?.colorId?.id]);

  // Memoize cart calculations
  const cartCalculations = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = Math.max(0, subtotal - appliedDiscount);
    return { subtotal, total };
  }, [cartItems, appliedDiscount]);

  // Helper functions for cart calculations - now use memoized values
  const calculateCartSubtotal = () => cartCalculations.subtotal;
  const calculateCartTotal = () => cartCalculations.total;

  const totalAmount = cartCalculations.total;
  const cashReceivedNum = parseFloat(cashReceived.toString());

  // Optimize change calculation
  const changeDue = useMemo(() => {
    if (paymentMethod !== 'cash' || !cashReceived) return 0;
    const cashReceivedNum = parseFloat(cashReceived.toString());
    return !isNaN(cashReceivedNum) && cashReceivedNum >= totalAmount ? cashReceivedNum - totalAmount : 0;
  }, [paymentMethod, cashReceived, totalAmount]);

  // Memoize getBrandName function
  const getBrandName = useCallback((brand: ApiProduct['brand']) =>
    typeof brand === 'object' ? brand.name : brand, []
  );

  // Helper function to safely get color info from variants
  const getColorInfo = useCallback((colorId: any) => {
    if (!colorId) return null;
    if (typeof colorId === 'object' && colorId.id) {
      return colorId;
    }
    return null;
  }, []);

  // Helper function to safely get unique colors from variants
  const getUniqueColors = useCallback((variants: any[]) => {
    if (!variants?.length) return [];
    const colorMap = new Map();
    
    variants.forEach((v, index) => {
      const colorInfo = getColorInfo(v.colorId);
      if (colorInfo) {
        colorMap.set(colorInfo.id, colorInfo);
      }
    });
    
    return Array.from(colorMap.values());
  }, [getColorInfo]);

  // Handle creating new pending cart
  const handleCreateNewCart = () => {
    const newCartId = createNewCart();
    if (!newCartId) {
      toast.warn('Không thể tạo thêm giỏ hàng. Tối đa 5 Hoá đơn chờ!');
      return;
    }
    toast.success(`Đã tạo giỏ hàng mới: Giỏ hàng ${pendingCarts.length + 1}`);
  };

  // Handle deleting a pending cart
  const handleDeleteCart = (cartId: string) => {
    setCartToDelete(cartId);
    setShowDeleteCartDialog(true);
  };

  // Confirm delete cart
  const confirmDeleteCart = () => {
    if (cartToDelete) {
      const cartToDeleteData = pendingCarts.find(cart => cart.id === cartToDelete);
      if (cartToDeleteData) {
        deleteCart(cartToDelete);
        toast.success(`Đã xóa ${cartToDeleteData.name}`);
      }
      setCartToDelete(null);
      setShowDeleteCartDialog(false);
    }
  };

  // Cancel delete cart
  const cancelDeleteCart = () => {
    setCartToDelete(null);
    setShowDeleteCartDialog(false);
  };

  // Handle switching active cart
  const handleSwitchCart = (cartId: string) => {
    setActiveCart(cartId);
    const cart = pendingCarts.find(c => c.id === cartId);
    if (cart) {
      toast.info(`Đã chuyển sang ${cart.name}`);
    }
  };

  // Sync active cart to main cart before checkout
  const syncActiveCartToMainCart = () => {
    if (activeCart) {
      // Clear main cart first
      clearCartStore();

      // Add all items from active cart to main cart
      activeCart.items.forEach(item => {
        addToCartStore(item);
      });

      // Set discount and voucher
      setDiscount(activeCart.appliedDiscount);
      setVoucher(activeCart.appliedVoucher);
      setCouponCode(activeCart.couponCode);
    }
  };

  // Handle viewing cart items
  const handleViewCartItems = (cartId: string) => {
    setSelectedCartForView(cartId);
    setShowCartItemsDialog(true);
  };

  // Close cart items dialog
  const closeCartItemsDialog = () => {
    setShowCartItemsDialog(false);
    setSelectedCartForView(null);
  };

  return (
    <div className="h-full">

      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/statistics">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Bán hàng tại quầy</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

      </div>
      {/* Pending Carts Tabs */}
      <div className='bg-white rounded-[6px] p-4 mb-4 shadow-sm border border-border'>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-maintext flex items-center gap-2">
            <Icon path={mdiCart} size={1} className="text-primary" />
            Hoá đơn chờ ({pendingCarts.length}/5)
          </h3>
          <Button
            onClick={handleCreateNewCart}
            disabled={pendingCarts.length >= 5}
          >
            <Icon path={mdiInvoicePlus} size={0.7} />
            Thêm mới
          </Button>
        </div>

        {pendingCarts.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pendingCarts.slice(0, 5).map((cart, index) => (
              <motion.button
                key={cart.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  'relative flex items-center gap-2 p-2 rounded-sm border-2 transition-all duration-200 min-w-[140px] group',
                  activeCartId === cart.id
                    ? 'border-primary bg-primary/5 text-primary shadow-md'
                    : 'border-border bg-white text-maintext hover:border-primary/50 hover:bg-primary/5'
                )}
                onClick={() => handleSwitchCart(cart.id)}
              >
                <div className="flex items-center gap-1 flex-1">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    cart.items.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                  <span className="text-sm font-medium truncate">{cart.name} <span className="text-sm text-maintext/70 font-semibold">({cart.items.reduce((sum, item) => sum + item.quantity, 0)})</span></span>
                </div>
                <button
                  key={`delete-${cart.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/70 p-1 hover:bg-red-400 bg-red-400 rounded-full hover:!text-white text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCart(cart.id);
                  }}
                >
                  <Icon path={mdiClose} size={0.7} className="hover:!text-white" />
                </button>
              </motion.button>
            ))}

            {pendingCarts.length > 5 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[100px] h-[46px] border-2 border-primary/50 flex items-center justify-center text-sm">
                    +{pendingCarts.length - 4} khác
                    <Icon path={mdiChevronDown} size={0.7} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {pendingCarts.slice(4).map((cart) => (
                    <DropdownMenuItem
                      key={cart.id}
                      className="flex items-center justify-between"
                      onClick={() => handleSwitchCart(cart.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          cart.items.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                        )} />
                        <span>{cart.name}</span>
                        {cart.items.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                          </Badge>
                        )}
                      </div>
                      <button
                        className="p-1 hover:bg-red-100 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCart(cart.id);
                        }}
                      >
                        <Icon path={mdiClose} size={0.4} className="text-red-500" />
                      </button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 overflow-hidden flex flex-col">
          <div className="bg-white rounded-[6px] p-4 mb-4 shadow-sm border border-border hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Icon path={mdiMagnify} size={1} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-maintext" />
                <Input
                  id="product-search"
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-[6px] border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex overflow-x-auto pb-2 scrollbar-thin gap-2">
              {dynamicCategories.map((category) => (
                <button
                  key={category.id}
                  className={cn(
                    'whitespace-nowrap px-4 py-2 rounded-[6px] text-sm font-medium transition-all duration-200',
                    activeCategoryName === category.name
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-50 text-maintext hover:bg-gray-100 hover:text-primary'
                  )}
                  onClick={() => {
                    setActiveCategoryName(category.name);
                    setSelectedProduct(null);
                    setSelectedApiVariant(null);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>



          <div className="bg-white rounded-xl p-4 flex-1 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 min-h-[400px]">
            {selectedProduct && <div className='w-full flex items-center justify-between mb-4'>
              <motion.button
                className="text-sm text-primary font-medium flex items-center gap-2 hover:text-primary/80 transition-colors bg-primary/5 px-4 py-2 rounded-full border border-primary/50"
                onClick={() => {
                  setSelectedProduct(null);
                  setSelectedApiVariant(null);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon path={mdiChevronLeft} size={0.7} />
                Quay lại danh sách sản phẩm
              </motion.button>
            </div>}
            {selectedProduct && selectedApiVariant ? (
              <div className="mb-4">
                <div className="flex flex-col lg:flex-row gap-8">
                  <motion.div
                    className="lg:w-1/2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border group">
                      <img
                        src={checkImageUrl(getVariantImageUrl(selectedApiVariant) || getVariantImageUrl(selectedProduct.variants[0]))}
                        alt={selectedProduct.name}
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    </div>
                    {selectedApiVariant && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          className='w-full mt-4'
                          onClick={addToCart}
                          disabled={selectedApiVariant.stock === 0}
                        >
                          <Icon path={mdiCartPlus} size={0.7} />
                          Thêm vào giỏ hàng POS
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Enhanced Product Information Section */}
                  <motion.div
                    className="lg:w-1/2 space-y-8"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {/* Product Header */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {getBrandName(selectedProduct.brand)}
                        </Badge>
                        <Badge variant="outline" className="text-maintext">
                          Admin POS
                        </Badge>
                        {(selectedProduct as any).hasDiscount && (
                          <Badge variant="destructive" className="bg-green-500">
                            -{(selectedProduct as any).discountPercent}% OFF
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-2xl font-bold text-maintext leading-tight">
                        {selectedProduct.name}
                      </h2>
                      
                      {(selectedProduct as any).hasDiscount && (selectedProduct as any).appliedPromotion && (
                        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          🎉 Đang áp dụng khuyến mãi: <span className="font-semibold">{(selectedProduct as any).appliedPromotion.name}</span>
                        </div>
                      )}

                      <motion.div
                        className="space-y-2"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="text-4xl font-bold text-primary">
                          {formatCurrency((selectedProduct as any).hasDiscount ? (selectedProduct as any).discountedPrice : selectedApiVariant.price)}
                        </div>
                        {(selectedProduct as any).hasDiscount && (
                          <div className="flex items-center gap-2">
                            <span className="text-xl text-maintext line-through">
                              {formatCurrency((selectedProduct as any).originalPrice)}
                            </span>
                            <Badge variant="destructive" className="bg-green-500">
                              -{(selectedProduct as any).discountPercent}% OFF
                            </Badge>
                          </div>
                        )}
                      </motion.div>
                    </div>
                    {/* Enhanced Color Selection */}
                    {uniqueColorsForSelectedProduct.length > 0 && (
                      <motion.div
                        className="mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Icon path={mdiPalette} size={1} className="text-primary" />
                          <h3 className="text-base font-semibold text-maintext">Màu sắc</h3>
                          {selectedApiVariant?.colorId && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              {selectedApiVariant.colorId.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          {uniqueColorsForSelectedProduct.map((color) => (
                            <motion.button
                              key={color.id}
                              className={cn(
                                'relative group flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 border-2',
                                selectedApiVariant?.colorId?.id === color.id
                                  ? 'border-primary ring-4 ring-primary/20 scale-110'
                                  : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                              )}
                              style={{ backgroundColor: color.code }}
                              onClick={() => handleColorSelectFromDetail(color.id)}
                              title={color.name}
                              whileHover={{ scale: selectedApiVariant?.colorId?.id === color.id ? 1.1 : 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {selectedApiVariant?.colorId?.id === color.id && (
                                <Icon
                                  path={mdiCheck}
                                  size={1}
                                  className="text-white drop-shadow-lg"
                                />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {/* Enhanced Size Selection */}
                    {availableSizesForSelectedColor.length > 0 && selectedApiVariant?.colorId && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Icon path={mdiRuler} size={1} className="text-primary" />
                          <h3 className="text-base font-semibold text-maintext">Kích thước</h3>
                          {selectedApiVariant?.sizeId && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              {selectedApiVariant.sizeId.name || (selectedApiVariant.sizeId.value ? getSizeLabel(Number(selectedApiVariant.sizeId.value)) : 'N/A')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {availableSizesForSelectedColor.map((size) => {
                            const variantForThisSize = selectedProduct.variants.find(v => v.colorId?.id === selectedApiVariant.colorId?.id && v.sizeId?.id === size.id);
                            const stockForThisSize = variantForThisSize?.stock || 0;
                            const isSelected = selectedApiVariant?.sizeId?.id === size.id;
                            return (
                              <Button
                                key={size.id}
                                variant={isSelected ? "outline" : "ghost"}
                                className={cn(
                                  'transition-all duration-300 min-w-[60px] h-auto py-2 px-4 flex flex-col items-center border-2',
                                  stockForThisSize === 0 && 'opacity-50 cursor-not-allowed'
                                )}
                                onClick={() => handleSizeSelectFromDetail(size.id)}
                                disabled={stockForThisSize === 0}
                              >
                                <span className="font-medium">
                                  {size.name || (size.value ? getSizeLabel(Number(size.value)) : 'N/A')}
                                </span>
                                <span className={cn(
                                  'text-xs mt-1',
                                  stockForThisSize === 0 ? 'text-red-500' : 'text-gray-500'
                                )}>
                                  {stockForThisSize === 0 ? 'Hết hàng' : `Kho: ${stockForThisSize}`}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Icon path={mdiPackageVariant} size={1} className="text-primary" />
                      <h3 className="text-base font-semibold text-maintext">Tồn kho</h3>
                      <Badge
                        variant={selectedApiVariant.stock > 10 ? "secondary" : selectedApiVariant.stock > 0 ? "outline" : "destructive"}
                        className={cn(
                          selectedApiVariant.stock > 10 ? "bg-green-100 text-green-700 border-green-200" :
                            selectedApiVariant.stock > 0 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                              "bg-red-100 text-red-700 border-red-200"
                        )}
                      >
                        {selectedApiVariant.stock > 0 ? `${selectedApiVariant.stock} sản phẩm` : 'Hết hàng'}
                      </Badge>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="grid" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="grid" className="flex items-center gap-1 text-maintext/70">
                      <Icon path={mdiViewGridOutline} size={0.8} />
                      Lưới
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center gap-1 text-maintext/70">
                      <Icon path={mdiTableLarge} size={0.8} />
                      Bảng
                    </TabsTrigger>
                  </TabsList>

                  <div className="text-sm text-maintext">
                    Hiển thị {apiIsLoading ? <Skeleton className="h-4 w-5 inline-block" /> : processedProducts.length} / {rawData?.data?.pagination?.totalItems || 0} sản phẩm
                  </div>
                </div>

                {apiIsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(pagination.limit)].map((_, index) => (
                      <CardSkeleton key={index} />
                    ))}
                  </div>
                ) : apiIsError ? (
                  <div className="text-center py-10 text-red-500">Lỗi khi tải sản phẩm. Vui lòng thử lại.</div>
                ) : processedProducts.length === 0 ? (
                  <div className="text-center py-10 text-maintext">Không tìm thấy sản phẩm nào.</div>
                ) : (
                  <>
                    <TabsContent value="grid" className="mt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {processedProducts.map((product) => {
                          const firstVariant = product.variants?.[0];
                          const uniqueColors = getUniqueColors(product.variants);
                          return (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white rounded-[6px] border border-border shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
                            >
                              <div
                                className="relative h-48 w-full bg-gray-50 overflow-hidden cursor-pointer"
                                onClick={() => handleProductSelect(product)}
                              >
                                <img
                                  src={checkImageUrl(getVariantImageUrl(firstVariant))}
                                  alt={product.name}
                                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute top-2 right-2 flex flex-col gap-1">
                                  {(product as any).hasDiscount && (
                                    <Badge variant="destructive" className="bg-green-500 text-white">
                                      -{(product as any).discountPercent}% OFF
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="p-4">
                                <h3
                                  className="font-medium text-maintext group-hover:text-primary transition-colors truncate cursor-pointer"
                                  onClick={() => handleProductSelect(product)}
                                >
                                  {product.name}
                                </h3>
                                <p className="text-maintext text-sm mb-2 truncate">{getBrandName(product.brand)}</p>
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <p className={`font-medium ${(product as any).hasDiscount ? 'text-primary' : 'text-primary'}`}>
                                      {firstVariant ? formatCurrency((product as any).hasDiscount ? (product as any).discountedPrice : firstVariant.price) : 'N/A'}
                                    </p>
                                    {(product as any).hasDiscount && (
                                      <p className="text-xs text-maintext line-through">
                                        {formatCurrency((product as any).originalPrice)}
                                      </p>
                                    )}
                                  </div>
                                  {uniqueColors.length > 0 && (
                                    <div className="flex -space-x-1">
                                      {uniqueColors.slice(0, 3).map((color, idx) => (
                                        <div
                                          key={color.id || `color-${idx}`}
                                          className="h-5 w-5 rounded-full border border-white"
                                          style={{ backgroundColor: color.code }}
                                          title={color.name}
                                        />
                                      ))}
                                      {uniqueColors.length > 3 && (
                                        <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs text-maintext">
                                          +{uniqueColors.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  className="w-full mt-3 flex items-center justify-center gap-2"
                                  onClick={() => handleProductSelect(product)}
                                  disabled={product.variants.every(v => v.stock === 0)}
                                >
                                  <Icon path={mdiEye} size={0.7} />
                                  Xem chi tiết
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </TabsContent>

                    <TabsContent value="table" className="mt-0">
                      <div className="border border-border rounded-[6px] overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="text-left py-3 px-4 font-medium text-maintext">Sản phẩm</th>
                              <th className="text-left py-3 px-4 font-medium text-maintext">Thương hiệu</th>
                              <th className="text-left py-3 px-4 font-medium text-maintext">Giá</th>
                              <th className="text-left py-3 px-4 font-medium text-maintext">Màu sắc</th>
                              <th className="text-left py-3 px-4 font-medium text-maintext">Kho</th>
                              <th className="text-center py-3 px-4 font-medium text-maintext">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {processedProducts.map((product) => {
                              const firstVariant = product.variants?.[0];
                              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                              const uniqueColorsCount = new Set(product.variants.map(v => (v.colorId as any)?.id)).size;
                              const firstAvailableVariant = product.variants.find(v => v.stock > 0) || product.variants[0];
                              return (
                                <tr
                                  key={product.id}
                                  className="border-t border-border hover:bg-muted/20 transition-colors cursor-pointer"
                                >
                                  <td className="py-3 px-4" onClick={() => handleProductSelect(product)}>
                                    <div className="flex items-center gap-2">
                                      <div className="relative h-10 w-10 rounded-[6px] overflow-hidden bg-gray-50">
                                        <img
                                          src={checkImageUrl(getVariantImageUrl(firstVariant))}
                                          alt={product.name}
                                          className="object-contain"
                                        />
                                      </div>
                                      <span className="font-medium text-maintext truncate max-w-[150px]">{product.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-maintext truncate max-w-[100px]" onClick={() => handleProductSelect(product)}>{getBrandName(product.brand)}</td>
                                  <td className="py-3 px-4" onClick={() => handleProductSelect(product)}>
                                    <div className="flex flex-col">
                                      <span className={`font-medium ${(product as any).hasDiscount ? 'text-primary' : 'text-primary'}`}>
                                        {firstVariant ? formatCurrency((product as any).hasDiscount ? (product as any).discountedPrice : firstVariant.price) : 'N/A'}
                                      </span>
                                      {(product as any).hasDiscount && (
                                        <span className="text-xs text-maintext line-through">
                                          {formatCurrency((product as any).originalPrice)}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4" onClick={() => handleProductSelect(product)}>
                                    {product.variants.length > 0 && (
                                      <div className="flex -space-x-1">
                                        {Array.from(new Map(product.variants.map(v => [(v.colorId as any)?.id, v.colorId])).values()).slice(0, 3).map((color, idx) => color && (
                                          <div
                                            key={(color as any).id || `table-color-${idx}`}
                                            className="h-5 w-5 rounded-full border"
                                            style={{ backgroundColor: (color as any).code }}
                                            title={(color as any).name}
                                          />
                                        ))}
                                        {uniqueColorsCount > 3 && (
                                          <div className="h-5 w-5 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs text-maintext">
                                            +{uniqueColorsCount - 3}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-4" onClick={() => handleProductSelect(product)}>
                                    <Badge variant={totalStock > 10 ? "secondary" : totalStock > 0 ? "outline" : "destructive"} className="text-xs !flex-shrink-0">
                                      <span className="flex-shrink-0">{totalStock > 10 ? "Còn hàng" : totalStock > 0 ? "Sắp hết" : "Hết hàng"}</span>
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductSelect(product);
                                              }}
                                            >
                                              <Icon path={mdiInformationOutline} size={0.7} className="text-maintext" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Chi tiết</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              disabled={product.variants.every(v => v.stock === 0)}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Use the product from the list (which already has promotions applied)
                                                const firstAvailableVariant = product.variants.find((v: any) => v.stock > 0);
                                                if (firstAvailableVariant) {
                                                  addItemToCorrectCart(product, firstAvailableVariant, false);
                                                } else {
                                                  toast.warn('Sản phẩm này đã hết hàng.');
                                                }
                                              }}
                                            >
                                              <Icon path={mdiPlus} size={0.7} className="text-maintext" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Thêm vào giỏ</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    {dataWithPromotions?.data?.pagination && dataWithPromotions.data.pagination.totalPages > 1 && (
                      <div className="flex justify-center mt-6">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (pagination.page > 1) {
                                    setPagination(p => ({ ...p, page: p.page - 1 }));
                                  }
                                }}
                                disabled={pagination.page <= 1}
                              />
                            </PaginationItem>
                            {(() => {
                              const pages = [];
                              const totalPages = dataWithPromotions.data.pagination.totalPages;
                              const currentPage = pagination.page;
                              const pageLimit = 5;

                              if (totalPages <= pageLimit) {
                                for (let i = 1; i <= totalPages; i++) {
                                  pages.push(
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        href="#"
                                        isActive={currentPage === i}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setPagination(p => ({ ...p, page: i }));
                                        }}
                                      >
                                        {i}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }
                              } else {
                                pages.push(
                                  <PaginationItem key={1}>
                                    <PaginationLink
                                      href="#"
                                      isActive={currentPage === 1}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setPagination(p => ({ ...p, page: 1 }));
                                      }}
                                    >
                                      1
                                    </PaginationLink>
                                  </PaginationItem>
                                );

                                if (currentPage > 3) {
                                  pages.push(<PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>);
                                }

                                let startPage = Math.max(2, currentPage - 1);
                                let endPage = Math.min(totalPages - 1, currentPage + 1);

                                if (currentPage <= 2) {
                                  endPage = Math.min(totalPages - 1, 3);
                                }
                                if (currentPage >= totalPages - 1) {
                                  startPage = Math.max(2, totalPages - 2);
                                }

                                for (let i = startPage; i <= endPage; i++) {
                                  pages.push(
                                    <PaginationItem key={i}>
                                      <PaginationLink
                                        href="#"
                                        isActive={currentPage === i}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setPagination(p => ({ ...p, page: i }));
                                        }}
                                      >
                                        {i}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                }

                                if (currentPage < totalPages - 2) {
                                  pages.push(<PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>);
                                }

                                pages.push(
                                  <PaginationItem key={totalPages}>
                                    <PaginationLink
                                      href="#"
                                      isActive={currentPage === totalPages}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setPagination(p => ({ ...p, page: totalPages }));
                                      }}
                                    >
                                      {totalPages}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              return pages;
                            })()}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (pagination.page < (dataWithPromotions?.data?.pagination?.totalPages || 1)) {
                                    setPagination(p => ({ ...p, page: p.page + 1 }));
                                  }
                                }}
                                disabled={pagination.page >= (dataWithPromotions?.data?.pagination?.totalPages || 1)}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </Tabs>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 w-full justify-between">
              {activeCart ? (
                <div className="flex items-center gap-2">
                  <span>{activeCart.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                  </Badge>
                </div>
              ) : (
                'Giỏ hàng chính'
              )}

              {pendingCarts.length > 4 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Icon path={mdiCart} size={0.7} />
                      <Icon path={mdiChevronDown} size={0.7} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {pendingCarts.map((cart) => (
                      <DropdownMenuItem
                        key={cart.id}
                        className="flex items-center justify-between"
                        onClick={() => handleSwitchCart(cart.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-2 h-2 rounded-full',
                            cart.items.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                          )} />
                          <span>{cart.name}</span>
                          {cart.items.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                            </Badge>
                          )}
                        </div>
                        <button
                          className="p-1 hover:bg-red-100 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCart(cart.id);
                          }}
                        >
                          <Icon path={mdiClose} size={0.4} className="text-red-500" />
                        </button>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-maintext">
                <Icon path={mdiCart} size={2} className="mx-auto mb-2 text-gray-300" />
                <p>Giỏ hàng trống</p>
                <p className="text-sm text-maintext">Thêm sản phẩm để bắt đầu</p>
              </div>
            ) : (
              <>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center gap-2"
                      >
                        <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-white">
                          <img
                            src={checkImageUrl(item.image)}
                            alt={item.name}
                            height={100}
                            width={100}
                            draggable="false"
                            className="object-contain h-full w-full flex-shrink-0"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-maintext truncate text-wrap">{item.name}</h4>
                          <p className="text-xs text-maintext">
                            {item.colorName} / {item.sizeName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg text-primary font-semibold">
                              {formatCurrency(item.price)}
                            </span>
                            {item.hasDiscount && item.originalPrice && (
                              <>
                                <span className="text-sm text-maintext line-through">
                                  {formatCurrency(item.originalPrice)}
                                </span>
                                {item.discountPercent && (
                                  <Badge variant="destructive" className="bg-green-500 text-xs">
                                    -{item.discountPercent}%
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateCartItemQuantity(item.id, -1)}
                            >
                              <Icon path={mdiMinus} size={0.7} />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value) || 0;
                                if (newQuantity < 0) {
                                  toast.warn('Số lượng không được âm.');
                                  return;
                                }
                                if (newQuantity > item.stock) {
                                  toast.warn(`Chỉ còn ${item.stock} sản phẩm trong kho.`);
                                  return;
                                }
                                if (newQuantity === 0) {
                                  removeCartItem(item.id);
                                  return;
                                }
                                // Calculate the difference and update
                                const difference = newQuantity - item.quantity;
                                if (difference !== 0) {
                                  updateCartItemQuantity(item.id, difference);
                                }
                              }}
                              onBlur={(e) => {
                                // Ensure we have a valid number on blur
                                const value = e.target.value;
                                if (value === '' || isNaN(parseInt(value))) {
                                  // Reset to current quantity if invalid
                                  e.target.value = item.quantity.toString();
                                }
                              }}
                              className="w-16 h-8 text-center text-sm"
                              min="1"
                              max={item.stock}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateCartItemQuantity(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Icon path={mdiPlus} size={0.7} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 bg-red-50 border border-red-500"
                              onClick={() => removeCartItem(item.id)}
                            >
                              <Icon path={mdiDelete} size={0.7} />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Voucher Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Nhập mã giảm giá..."
                      value={couponCode}
                      onChange={(e) => {
                        if (activeCartId) {
                          // Update coupon code in pending cart
                          const activeCart = getActiveCart();
                          if (activeCart) {
                            setPendingCartDiscount(activeCartId, activeCart.appliedDiscount, activeCart.appliedVoucher, e.target.value);
                          }
                        } else {
                          setCouponCode(e.target.value);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="default"
                      onClick={applyCoupon}
                      disabled={!couponCode.trim()}
                    >
                      Áp dụng
                    </Button>
                  </div>
                  <Button
                    variant="link"
                    className="text-sm text-primary mt-1 px-0"
                    onClick={() => setShowVouchersDialog(true)}
                  >
                    Xem danh sách mã giảm giá
                  </Button>

                  {appliedVoucher && (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Icon path={mdiTag} size={0.7} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Mã: {appliedVoucher.code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
                        onClick={() => {
                          if (activeCartId) {
                            setPendingCartDiscount(activeCartId, 0, null, '');
                          } else {
                            setDiscount(0);
                            setVoucher(null);
                            setCouponCode('');
                          }
                        }}
                      >
                        <Icon path={mdiClose} size={0.7} />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(calculateCartSubtotal())}</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(appliedDiscount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatCurrency(calculateCartTotal())}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0}
                >
                  <Icon path={mdiCashRegister} size={0.7} className="mr-2" />
                  Thanh toán ({formatCurrency(calculateCartTotal())})
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-4xl">
          <ScrollArea className="max-h-[70vh] p-1">
            <DialogHeader>
              <DialogTitle>Xác nhận thanh toán</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label htmlFor="user-select" className="text-right text-sm text-maintext cursor-help font-semibold">
                        Chọn khách hàng
                      </label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p>Chọn khách hàng có sẵn hoặc để trống để nhập thủ công</p>
                        {usersData?.data?.accounts && (
                          <p className="text-xs text-gray-400 mt-1">
                            Có {usersData.data.accounts.length} khách hàng trong hệ thống
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Select
                  value={selectedUserId}
                  onValueChange={handleUserSelect}
                >
                  <SelectTrigger className="col-span-3 h-12">
                    <SelectValue placeholder={`Chọn khách hàng (${usersData?.data?.accounts?.length || 0} khách hàng)`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">
                      <div className="flex items-center gap-4 py-1">
                        <Icon path={mdiAccount} size={0.7} className="text-gray-400" />
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-maintext font-semibold">Khách vãng lai</span>
                          <span className="text-xs text-maintext">Nhập thông tin thủ công</span>
                        </div>
                      </div>
                    </SelectItem>
                    {isLoadingUsers ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center gap-4 py-2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-300 border-t-blue-600 rounded-full"></div>
                          <span className="text-maintext">Đang tải danh sách khách hàng...</span>
                        </div>
                      </SelectItem>
                    ) : usersData?.data?.accounts && usersData.data.accounts.length > 0 ? (
                      usersData.data.accounts.map((user: IAccount) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-4 py-1">
                            <Icon path={mdiAccount} size={0.7} className="text-primary" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-semibold truncate">{user.fullName}</span>
                                {(user as any).code && (
                                  <span className="px-2 py-0.5 text-xs font-mono bg-green-50 text-green-600 rounded border border-green-200">
                                    {(user as any).code}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-maintext mt-0.5">
                                {user.phoneNumber ? (
                                  <span className="flex items-center gap-1 text-maintext">
                                    📱 {user.phoneNumber}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-maintext">
                                    ✉️ {user.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-customers" disabled>
                        <div className="flex items-center gap-4 py-2">
                          <Icon path={mdiAccount} size={0.7} className="text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-maintext font-medium">Không có khách hàng nào</span>
                            <span className="text-xs text-gray-400">Vui lòng thêm khách hàng mới</span>
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="customer-name" className="text-right text-sm text-maintext font-semibold">
                  Tên khách hàng
                </label>
                <Input
                  id="customer-name"
                  placeholder="Tên khách hàng"
                  className="col-span-3"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    // Nếu người dùng nhập thủ công thì reset selected user
                    if (selectedUserId && selectedUserId !== 'guest') {
                      setSelectedUserId('guest');
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="customer-phone" className="text-right text-sm text-maintext font-semibold">
                  Số điện thoại
                </label>
                <Input
                  id="customer-phone"
                  placeholder="Số điện thoại"
                  className="col-span-3"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    // Nếu người dùng nhập thủ công thì reset selected user
                    if (selectedUserId && selectedUserId !== 'guest') {
                      setSelectedUserId('guest');
                    }
                  }}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="payment-method" className="text-right text-sm text-maintext font-semibold">
                  Thanh toán
                </label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value);
                    setTransferPaymentCompleted(false);
                    if (value === 'transfer') {
                      setCashReceived(calculateCartTotal().toString());
                    } else {
                      setCashReceived('');
                    }
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Icon path={mdiCashMultiple} size={0.7} className="text-maintext" />
                        <span>Tiền mặt</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="transfer">
                      <div className="flex items-center gap-2">
                        <Icon path={mdiBankTransfer} size={0.7} className="text-maintext" />
                        <span>Chuyển khoản</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'cash' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="cash-received" className="text-right text-sm text-maintext font-semibold">
                    Tiền khách đưa
                  </label>
                  <Input
                    id="cash-received"
                    type="number"
                    placeholder="Nhập số tiền khách đưa"
                    className="col-span-3"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    min={0}
                  />
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="grid grid-cols-1 gap-4">
                  <div
                    className="bg-gray-50 rounded-lg p-4 text-center"
                    onClick={() => {
                      if (!transferPaymentCompleted) {
                        setTransferPaymentCompleted(true);
                        setShowPaymentSuccessModal(true);
                      }
                    }}
                    style={{ cursor: !transferPaymentCompleted ? 'pointer' : 'default' }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-maintext">Quét mã QR để thanh toán</h3>
                    <div className="flex justify-center mb-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <QRCodeComponent
                          value={`BANK_TRANSFER|970415|0123456789|Clothes Shop|${calculateCartTotal()}|Thanh toan don hang ${new Date().getTime()}`}
                          size={200}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-maintext space-y-1">
                      <p><strong>Ngân hàng:</strong> Vietcombank</p>
                      <p><strong>Số tài khoản:</strong> 0123456789</p>
                      <p><strong>Chủ tài khoản:</strong> Clothes Shop</p>
                      <p><strong>Số tiền:</strong> {formatCurrency(calculateCartTotal())}</p>
                      <p><strong>Nội dung:</strong> Thanh toan don hang {new Date().getTime()}</p>
                    </div>
                    {transferPaymentCompleted && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-green-700">
                          <svg className="w-5 h-5" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Thanh toán thành công!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-maintext">
                  <span className="text-maintext text-base">Số lượng sản phẩm:</span>
                  <span className="text-maintext text-base">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-maintext">
                  <span className="text-base">Tạm tính:</span>
                  <span className="text-base">{formatCurrency(calculateCartSubtotal())}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Giảm giá ({appliedVoucher?.code || 'KM'}):</span>
                    <span>-{formatCurrency(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                  <span className="text-maintext font-semibold">Tổng thanh toán:</span>
                  <span className="text-primary font-semibold">{formatCurrency(calculateCartTotal())}</span>
                </div>
                {paymentMethod === 'cash' && !isNaN(parseFloat(cashReceived.toString())) && parseFloat(cashReceived.toString()) >= calculateCartTotal() && changeDue >= 0 && (
                  <div className="flex justify-between font-medium text-base pt-2">
                    <span className="text-maintext font-semibold">Tiền thừa trả khách:</span>
                    <span className="text-primary font-semibold">{formatCurrency(changeDue)}</span>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className='pb-4'>
              <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={checkoutIsLoading ||
                  (paymentMethod === 'cash' && (cashReceived.toString() === '' || parseFloat(cashReceived.toString()) < calculateCartTotal() || isNaN(parseFloat(cashReceived.toString())))) ||
                  (paymentMethod === 'transfer' && !transferPaymentCompleted)}
              >
                {checkoutIsLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Icon path={mdiCashRegister} size={0.7} className="mr-2" />
                    Hoàn tất thanh toán
                  </>
                )}
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      {showInvoiceDialog && currentInvoiceData && (
        <Suspense fallback={<div>Loading...</div>}>
          <InvoiceDialog
            open={showInvoiceDialog}
            onOpenChange={setShowInvoiceDialog}
            invoiceData={currentInvoiceData}
            formatCurrency={formatCurrency}
            formatDateTimeForInvoice={formatDateTimeForInvoice}
          />
        </Suspense>
      )}

      {/* Vouchers Dialog */}
      {showVouchersDialog && (
        <Suspense fallback={<div>Loading...</div>}>
          <VouchersDialog
            open={showVouchersDialog}
            onOpenChange={setShowVouchersDialog}
            onVoucherSelect={(code: string) => {
              if (activeCartId) {
                const activeCart = getActiveCart();
                if (activeCart) {
                  setPendingCartDiscount(activeCartId, activeCart.appliedDiscount, activeCart.appliedVoucher, code);
                }
              } else {
                setCouponCode(code);
              }
              applyCoupon();
            }}
            formatCurrency={formatCurrency}
          />
        </Suspense>
      )}

      {/* Delete Cart Confirmation Dialog */}
      <Dialog open={showDeleteCartDialog} onOpenChange={setShowDeleteCartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa giỏ hàng</DialogTitle>
            <DialogDescription>
              {cartToDelete && (
                <>
                  Bạn có chắc chắn muốn xóa "{pendingCarts.find(cart => cart.id === cartToDelete)?.name}"?
                  <br />
                  <span className="text-red-600 font-medium">Hành động này không thể hoàn tác.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteCart}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCart}>
              <Icon path={mdiDelete} size={0.7} className="mr-2" />
              Xóa giỏ hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Success Modal */}
      <Dialog open={showPaymentSuccessModal} onOpenChange={setShowPaymentSuccessModal}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-center text-green-600">Thanh toán thành công!</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-maintext mb-2">Giao dịch hoàn tất</h3>
            <p className="text-sm text-maintext text-center mb-4">
              Chúng tôi đã nhận được thanh toán của bạn qua chuyển khoản.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 w-full border">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Số tiền:</span>
                  <span className="font-medium">{formatCurrency(calculateCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phương thức:</span>
                  <span className="font-medium">Chuyển khoản</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian:</span>
                  <span className="font-medium">{new Date().toLocaleTimeString('vi-VN')}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => setShowPaymentSuccessModal(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
