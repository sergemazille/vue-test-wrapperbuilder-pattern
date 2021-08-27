import App from './App.vue';
import { FavoriteService } from './services/FavoriteService';
import { UserService } from './services/UserService';
import Vue from 'vue';

Vue.config.productionTip = false;

const userService = new UserService();
const favoriteService = new FavoriteService();

new Vue({
  render: h => h(App),
  provide: {
    userService,
    favoriteService,
  },
}).$mount('#app');
