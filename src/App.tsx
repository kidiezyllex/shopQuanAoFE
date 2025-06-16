import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ReactQueryClientProvider } from '@/provider/ReactQueryClientProvider'
import { UserProvider } from '@/context/useUserContext'
import { ToastContainer } from 'react-toastify'

// Layout components
import RootLayout from '@/layouts/RootLayout'
import AdminLayout from '@/layouts/AdminLayout'

// Lazy load page components
const HomePage = React.lazy(() => import('@/pages/HomePage'))
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'))
const AboutUsPage = React.lazy(() => import('@/pages/AboutUsPage'))
const AccountPage = React.lazy(() => import('@/pages/AccountPage'))
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'))
const ProductsPage = React.lazy(() => import('@/pages/ProductsPage'))
const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage'))
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage'))
const ChangePasswordPage = React.lazy(() => import('@/pages/ChangePasswordPage'))
const OrdersPage = React.lazy(() => import('@/pages/OrdersPage'))
const OrderDetailPage = React.lazy(() => import('@/pages/OrderDetailPage'))
const ReturnsPage = React.lazy(() => import('@/pages/ReturnsPage'))
const CheckoutShippingPage = React.lazy(() => import('@/pages/CheckoutShippingPage'))
const CheckoutSuccessPage = React.lazy(() => import('@/pages/CheckoutSuccessPage'))
const PaymentResultPage = React.lazy(() => import('@/pages/PaymentResultPage'))

// Lazy load admin pages
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminAccountsPage = React.lazy(() => import('@/pages/admin/AdminAccountsPage'))
const AdminAccountCreatePage = React.lazy(() => import('@/pages/admin/AdminAccountCreatePage'))
const AdminAccountEditPage = React.lazy(() => import('@/pages/admin/AdminAccountEditPage'))
const AdminDiscountsPage = React.lazy(() => import('@/pages/admin/AdminDiscountsPage'))
const AdminPromotionsPage = React.lazy(() => import('@/pages/admin/AdminPromotionsPage'))
const AdminPromotionCreatePage = React.lazy(() => import('@/pages/admin/AdminPromotionCreatePage'))
const AdminPromotionEditPage = React.lazy(() => import('@/pages/admin/AdminPromotionEditPage'))
const AdminVouchersPage = React.lazy(() => import('@/pages/admin/AdminVouchersPage'))
const AdminVoucherCreatePage = React.lazy(() => import('@/pages/admin/AdminVoucherCreatePage'))
const AdminVoucherEditPage = React.lazy(() => import('@/pages/admin/AdminVoucherEditPage'))
const AdminOrdersPage = React.lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminOrderDetailPage = React.lazy(() => import('@/pages/admin/AdminOrderDetailPage'))
const AdminOrderCreatePage = React.lazy(() => import('@/pages/admin/AdminOrderCreatePage'))
const AdminOrderEditPage = React.lazy(() => import('@/pages/admin/AdminOrderEditPage'))
const AdminPosPage = React.lazy(() => import('@/pages/admin/AdminPosPage'))
const AdminProductsPage = React.lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminProductBrandsPage = React.lazy(() => import('@/pages/admin/AdminProductBrandsPage'))
const AdminProductCategoriesPage = React.lazy(() => import('@/pages/admin/AdminProductCategoriesPage'))
const AdminProductColorsPage = React.lazy(() => import('@/pages/admin/AdminProductColorsPage'))
const AdminProductCreatePage = React.lazy(() => import('@/pages/admin/AdminProductCreatePage'))
const AdminProductEditPage = React.lazy(() => import('@/pages/admin/AdminProductEditPage'))
const AdminProductMaterialsPage = React.lazy(() => import('@/pages/admin/AdminProductMaterialsPage'))
const AdminProductSizesPage = React.lazy(() => import('@/pages/admin/AdminProductSizesPage'))
const AdminReturnsPage = React.lazy(() => import('@/pages/admin/AdminReturnsPage'))
const AdminReturnCreatePage = React.lazy(() => import('@/pages/admin/AdminReturnCreatePage'))
const AdminReturnEditPage = React.lazy(() => import('@/pages/admin/AdminReturnEditPage'))
const AdminStatisticsPage = React.lazy(() => import('@/pages/admin/AdminStatisticsPage'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-muted-foreground">Đang tải...</p>
    </div>
  </div>
)

function App() {
  return (
    <ReactQueryClientProvider>
      <Router>
        <UserProvider>
          <ToastContainer 
            position="top-right" 
            autoClose={4000} 
            hideProgressBar={false} 
            newestOnTop 
            closeOnClick 
            rtl={false} 
            pauseOnFocusLoss 
            draggable 
            pauseOnHover 
            theme="light" 
          />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes with main layout */}
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about-us" element={<AboutUsPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/change-password" element={<ChangePasswordPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="returns" element={<ReturnsPage />} />
                <Route path="checkout/shipping" element={<CheckoutShippingPage />} />
                <Route path="checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="payment-result" element={<PaymentResultPage />} />
              </Route>

              {/* Auth routes (no layout) */}
              <Route path="auth/login" element={<LoginPage />} />
              <Route path="auth/register" element={<RegisterPage />} />

              {/* Admin routes with admin layout */}
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="statistics" element={<AdminStatisticsPage />} />
                
                {/* Accounts */}
                <Route path="accounts" element={<AdminAccountsPage />} />
                <Route path="accounts/create" element={<AdminAccountCreatePage />} />
                <Route path="accounts/edit/:id" element={<AdminAccountEditPage />} />
                
                {/* Discounts */}
                <Route path="discounts" element={<AdminDiscountsPage />} />
                <Route path="discounts/promotions" element={<AdminPromotionsPage />} />
                <Route path="discounts/promotions/create" element={<AdminPromotionCreatePage />} />
                <Route path="discounts/promotions/edit/:id" element={<AdminPromotionEditPage />} />
                <Route path="discounts/vouchers" element={<AdminVouchersPage />} />
                <Route path="discounts/vouchers/create" element={<AdminVoucherCreatePage />} />
                <Route path="discounts/vouchers/edit/:id" element={<AdminVoucherEditPage />} />
                
                {/* Orders */}
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
                <Route path="orders/create" element={<AdminOrderCreatePage />} />
                <Route path="orders/edit/:id" element={<AdminOrderEditPage />} />
                
                {/* POS */}
                <Route path="pos" element={<AdminPosPage />} />
                
                {/* Products */}
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/brands" element={<AdminProductBrandsPage />} />
                <Route path="products/categories" element={<AdminProductCategoriesPage />} />
                <Route path="products/colors" element={<AdminProductColorsPage />} />
                <Route path="products/create" element={<AdminProductCreatePage />} />
                <Route path="products/edit/:id" element={<AdminProductEditPage />} />
                <Route path="products/materials" element={<AdminProductMaterialsPage />} />
                <Route path="products/sizes" element={<AdminProductSizesPage />} />
                
                {/* Returns */}
                <Route path="returns" element={<AdminReturnsPage />} />
                <Route path="returns/create" element={<AdminReturnCreatePage />} />
                <Route path="returns/edit/:id" element={<AdminReturnEditPage />} />
              </Route>

              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </UserProvider>
      </Router>
    </ReactQueryClientProvider>
  )
}

export default App