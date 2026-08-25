import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/homepage/HomePage";
import ContactPage from "./pages/contact/ContactPage";
import StorePage from "./pages/store/StorePage";
import CategoryDetail from "./pages/category/CategoryDetail";
import ProductDetail from "./pages/product/ProductDetail";
import ShoppingCart from "./pages/cart/ShoppingCart";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import MainLayout from "./layout/MainLayout";
import ManagerLayout from "./layout/ManagerLayout";
import UserLayout from "./layout/UserLayout";
import AllOrder from "./pages/manager/AllOrder";
import AllProduct from "./pages/manager/AllProduct";
import AddCategory from "./pages/manager/AddCategory";
import ManagerAppointments from "./pages/manager/ManagerAppointments";
import ShippingAddress from "./pages/user/account/ShippingAddress";
import ChangePass from "./pages/user/account/ChangePass";
import Profile from "./pages/user/account/Profile";
import ProcessOrder from "./pages/user/order-manager/ProcessOder";
import CompletedOrder from "./pages/user/order-manager/CompletedOrder";
import UserAppointments from "./pages/user/appointments/UserAppointments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="store" element={<StorePage />} />
          <Route path="category/:categoryId" element={<CategoryDetail />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<ShoppingCart />} />
          <Route path="checkout" element={<CheckoutPage />} />
        </Route>

        {/* Manager Routes with ProtectedManagerLayout */}
        <Route path="manager" element={<ManagerLayout />}>
          <Route path="appointments" element={<ManagerAppointments />} />
          <Route path="allorder" element={<AllOrder />} />
          <Route path="allproduct" element={<AllProduct />} />
          <Route path="addcategory" element={<AddCategory />} />
        </Route>

        {/* User Routes with UserLayout */}
        <Route path="user" element={<UserLayout />}>
          <Route path="profile" element={<Profile />} />
          <Route path="appointments" element={<UserAppointments />} />
          <Route path="shipping-address" element={<ShippingAddress />} />
          <Route path="change-password" element={<ChangePass />} />
          <Route path="processing-orders" element={<ProcessOrder />} />
          <Route path="completed-orders" element={<CompletedOrder />} />
        </Route>

        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
