import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Cart } from './components/cart/cart';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { Products } from './components/products/products';


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
    path: '**', 
    redirectTo: '' 
  }
];