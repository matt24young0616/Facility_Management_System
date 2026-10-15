import { createRouter, createWebHistory } from 'vue-router';
import MapView from '../views/Mapview.vue'; // matches your file name exactly
import FacilityHub from '../views/FacilityHub.vue'

// const routes = [
//   { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
//   { path: '/map', name: 'Map', component: MapView },
//   { path: '/facilityhub', name: 'FacilityHub', component: FacilityHub}
// ];

const routes = [
  { path: '/', redirect: '/facilityhub' },
  { path: '/map', name: 'Map', component: MapView },
  { path: '/facilityhub', name: 'FacilityHub', component: FacilityHub}
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes, // pass the array here
});

export default router;

