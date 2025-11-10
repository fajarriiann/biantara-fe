import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import Cart from "../components/Cart.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/cart', component: Cart },
]

export default createRouter({
    history: createWebHistory(),
    routes,
})