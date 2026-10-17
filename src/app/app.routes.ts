import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Cart } from './components/cart/cart';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { Products } from './components/products/products';

import { Addproduct } from './components/addproduct/addproduct';
import { OrderHistory } from './order-history/order-history';

export const routes: Routes = [
  { 
    path: '',
     component: Home 
  },
  { 
    path: 'products',
    component: Products 
  },
  { 
    path: 'cart',
    component: Cart 
  },
  { 
    path: 'register', 
    component: Register 
  },
  { 
    path: 'login', 
    component: Login 
  },
  {
    path: 'order-history',
    component: OrderHistory
  },
  {
    path: 'admin/add-product',
    component: Addproduct
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];