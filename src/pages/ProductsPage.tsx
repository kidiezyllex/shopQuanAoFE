import React, { useState, useEffect, useMemo } from "react"
 
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icon } from "@mdi/react"
import { mdiCartOutline, mdiHeartOutline, mdiEye, mdiFilterOutline, mdiClose, mdiMagnify, mdiPercent } from "@mdi/js"
import { useProducts, useSearchProducts } from "@/hooks/product"
import { usePromotions } from "@/hooks/promotion"
import { applyPromotionsToProducts, calculateProductDiscount } from "@/lib/promotions"
import type { IProductFilter } from "@/interface/request/product"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { checkImageUrl } from "@/lib/utils"
import { useCartStore } from "@/stores/useCartStore"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion, AnimatePresence } from "framer-motion"
import QrCodeScanner from "@/components/ProductPage/QrCodeScanner"
import VoucherForm from "@/components/ProductPage/VoucherForm"
import CartIcon from "@/components/ui/CartIcon"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface ProductCardProps {
  product: any
  onAddToCart: () => void
  onQuickView: () => void
  onAddToWishlist: () => void
}

interface ProductFiltersProps {
  filters: IProductFilter
  onChange: (filters: Partial<IProductFilter>) => void
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
}

const ProductsPage: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
  })
  const [filters, setFilters] = useState<IProductFilter>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("default")
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; voucherId: string } | null>(
    null,
  )
  const [isSearching, setIsSearching] = useState(false)
  const { addToCart } = useCartStore()

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery) {
        setIsSearching(true)
      } else {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timerId)
  }, [searchQuery])

  const paginationParams: IProductFilter = {
    page: pagination.page,
    limit: pagination.limit,
    status: "HOAT_DONG",
  }

  const productsQuery = useProducts(paginationParams)
  const searchQuery2 = useSearchProducts(isSearching ? { keyword: searchQuery, status: "HOAT_DONG" } : { keyword: "" })
  const { data: rawData, isLoading, isError } = isSearching ? searchQuery2 : productsQuery
  const { data: promotionsData } = usePromotions({status: "HOAT_DONG"});
  
  const data = useMemo(() => {
    if (!rawData || !rawData.data || !rawData.data.products) return rawData
    let filteredProducts = [...rawData.data.products]
    // Apply promotions first to get correct pricing
    if (promotionsData?.data?.promotions) {
      filteredProducts = applyPromotionsToProducts(filteredProducts, promotionsData.data.promotions)
    } 

    // Apply filters after promotions
    if (filters.brands && filters.brands.length > 0) {
      const brandsArray = Array.isArray(filters.brands) ? filters.brands : [filters.brands]
      filteredProducts = filteredProducts.filter((product) => {
        const brandId = typeof product.brand === "object" ? (product.brand as any).id : product.brand
        return brandsArray.includes(brandId)
      })
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoriesArray = Array.isArray(filters.categories) ? filters.categories : [filters.categories]
      filteredProducts = filteredProducts.filter((product) => {
        const categoryId = typeof product.category === "object" ? (product.category as any).id : product.category
        return categoriesArray.includes(categoryId)
      })
    }

    if (filters.color) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants.some((variant: any) => {
          const colorId = typeof variant.colorId === "object" ? variant.colorId.id : variant.colorId
          return colorId === filters.color
        }),
      )
    }

    if (filters.size) {
      filteredProducts = filteredProducts.filter((product) =>
        product.variants.some((variant: any) => {
          const sizeId = typeof variant.sizeId === "object" ? variant.sizeId.id : variant.sizeId
          return sizeId === filters.size
        }),
      )
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minPrice = filters.minPrice !== undefined ? filters.minPrice : 0
      const maxPrice = filters.maxPrice !== undefined ? filters.maxPrice : Number.POSITIVE_INFINITY

      filteredProducts = filteredProducts.filter((product: any) => {
        // Calculate discount from promotions data if available
        let price = product.variants[0]?.price || 0;
        
        if (promotionsData?.data?.promotions) {
          const discount = calculateProductDiscount(
            (product as any)?.id,
            price,
            promotionsData.data.promotions
          );
          
          if (discount.discountPercent > 0) {
            price = discount.discountedPrice;
          }
        }
        
        return price >= minPrice && price <= maxPrice
      })
    }

    // Sắp xếp sản phẩm
    if (sortOption !== "default") {
      filteredProducts.sort((a: any, b: any) => {
        // Calculate discount prices from promotions data if available
        let priceA = a.variants[0]?.price || 0;
        let priceB = b.variants[0]?.price || 0;
        
        if (promotionsData?.data?.promotions) {
          const discountA = calculateProductDiscount(a.id, priceA, promotionsData.data.promotions);
          const discountB = calculateProductDiscount(b.id, priceB, promotionsData.data.promotions);
          
          if (discountA.discountPercent > 0) {
            priceA = discountA.discountedPrice;
          }
          if (discountB.discountPercent > 0) {
            priceB = discountB.discountedPrice;
          }
        }
        
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()

        switch (sortOption) {
          case "price-asc":
            return priceA - priceB
          case "price-desc":
            return priceB - priceA
          case "newest":
            return dateB - dateA
          case "popularity":
            const stockA = a.variants.reduce((total: number, variant: any) => total + variant.stock, 0)
            const stockB = b.variants.reduce((total: number, variant: any) => total + variant.stock, 0)
            return stockB - stockA
          default:
            return 0
        }
      })
    }

    return {
      ...rawData,
      data: {
        ...rawData.data,
        products: filteredProducts,
      },
    }
  }, [rawData, filters, sortOption, promotionsData])

  const handleFilterChange = (updatedFilters: Partial<IProductFilter>) => {
    setFilters((prev) => ({
      ...prev,
      ...updatedFilters,
    }))
  }

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen)
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }))
  }

  const handleAddToCart = (product: any) => {
    // Find the first available variant
    const availableVariant = product.variants.find((variant: any) => variant.stock > 0)
    
    if (!availableVariant) {
      toast.error("Sản phẩm đã hết hàng")
      return
    }

    // Calculate discount from promotions data if available
    let price = availableVariant.price;
    let discountPercent = 0;
    
    if (promotionsData?.data?.promotions) {
      const discount = calculateProductDiscount(
        (product as any)?.id,
        price,
        promotionsData.data.promotions
      );
      
      if (discount.discountPercent > 0) {
        price = discount.discountedPrice;
        discountPercent = discount.discountPercent;
      }
    }

    const cartItem = {
      _id: `${(product as any)?.id}-${availableVariant.id}`,
      productId: (product as any)?.id,
      variantId: availableVariant.id,
      name: product.name,
      price: price,
      originalPrice: availableVariant.price,
      discountPercent: discountPercent,
      quantity: 1,
      image: product.images?.[0] || "/placeholder-image.jpg",
      color: typeof availableVariant.colorId === "object" ? availableVariant.colorId.name : "N/A",
      size: typeof availableVariant.sizeId === "object" ? availableVariant.sizeId.name : "N/A",
      stock: availableVariant.stock,
    }

    addToCart(cartItem, 1)
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
  }

  const handleQuickView = (product: any) => {
  }

  const handleAddToWishlist = (product: any) => {
    // Implement wishlist functionality
    toast.success(`Đã thêm ${product.name} vào danh sách yêu thích`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Có lỗi xảy ra</h2>
          <p className="text-gray-600">Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</p>
        </div>
      </div>
    )
  }

  const products = data?.data?.products || []
  const totalPages = Math.ceil((data?.data?.pagination?.totalItems || 0) / pagination.limit)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Icon path={mdiMagnify} size={1} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleFilter} className="lg:hidden">
              <Icon path={mdiFilterOutline} size={1} className="mr-2" />
              Bộ lọc
            </Button>
            
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="popularity">Phổ biến</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${isFilterOpen ? 'block' : 'hidden'} lg:w-64 w-full`}>
            <ProductFilters filters={filters} onChange={handleFilterChange} />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product: any) => (
                    <ProductCard
                      key={(product as any)?.id}
                      product={product}
                      promotionsData={promotionsData}
                      onAddToCart={() => handleAddToCart(product)}
                      onQuickView={() => handleQuickView(product)}
                      onAddToWishlist={() => handleAddToWishlist(product)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (pagination.page > 1) {
                              handlePageChange(pagination.page - 1)
                            }
                          }}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={page === pagination.page}
                            onClick={(e) => {
                              e.preventDefault()
                              handlePageChange(page)
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (pagination.page < totalPages) {
                              handlePageChange(pagination.page + 1)
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product, promotionsData, onAddToCart, onQuickView, onAddToWishlist }: ProductCardProps & { promotionsData?: any }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  // Calculate discount from promotions data if available
  const basePrice = product.variants[0]?.price || 0;
  let finalPrice = basePrice;
  let discountPercent = 0;
  
  if (promotionsData?.data?.promotions) {
    const discount = calculateProductDiscount(
      (product as any)?.id,
      basePrice,
      promotionsData.data.promotions
    );
    
    if (discount.discountPercent > 0) {
      finalPrice = discount.discountedPrice;
      discountPercent = discount.discountPercent;
    }
  }

  const isOutOfStock = product.variants.every((variant: any) => variant.stock === 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 relative">
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
              <Icon path={mdiPercent} size={0.5} className="mr-1" />
              -{discountPercent}%
            </div>
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <span className="text-white font-bold text-lg">Hết hàng</span>
          </div>
        )}

        <div className="relative overflow-hidden">
          <img
            src={checkImageUrl(product.images?.[0]) || "/placeholder-image.jpg"}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
              >
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={onQuickView}
                    className="rounded-full p-2"
                  >
                    <Icon path={mdiEye} size={0.8} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={onAddToWishlist}
                    className="rounded-full p-2"
                  >
                    <Icon path={mdiHeartOutline} size={0.8} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            {discountPercent > 0 ? (
              <>
                <span className="text-lg font-bold text-red-600">{formatPrice(finalPrice)}</span>
                <span className="text-sm text-gray-500 line-through">{formatPrice(basePrice)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">{formatPrice(finalPrice)}</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {product.variants.reduce((total: number, variant: any) => total + variant.stock, 0)} có sẵn
            </div>
            
            <Button
              size="sm"
              onClick={onAddToCart}
              disabled={isOutOfStock}
              className="flex items-center gap-1"
            >
              <Icon path={mdiCartOutline} size={0.7} />
              Thêm
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Product Filters Component
const ProductFilters = ({ filters, onChange }: ProductFiltersProps) => {
  // This would need to be implemented with actual filter data
  // For now, returning a placeholder
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Bộ lọc</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Giá</h4>
          <Slider
            defaultValue={[0, 1000000]}
            max={1000000}
            step={10000}
            className="w-full"
            onValueChange={(values) => {
              onChange({
                minPrice: values[0],
                maxPrice: values[1]
              })
            }}
          />
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Thương hiệu</h4>
          <div className="space-y-2">
            {/* Brand filters would go here */}
            <p className="text-sm text-gray-500">Đang tải...</p>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Danh mục</h4>
          <div className="space-y-2">
            {/* Category filters would go here */}
            <p className="text-sm text-gray-500">Đang tải...</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onChange({})}
        >
          Xóa bộ lọc
        </Button>
      </div>
    </Card>
  )
}

export default ProductsPage
