<template>
  <div class="composant">
    <p>{{ greetingMessage }}</p>
    <h1>{{ user.firstname }} {{ user.lastname }}</h1>
    <button @click="saveFavorite">Save in favorites</button>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-property-decorator';
import { User, UserService } from '@/services/UserService';
import { FavoriteService } from '@/services/FavoriteService';

@Component
export default class UserComponent extends Vue {
  @Prop({ required: true })
  private userId!: number;

  @Inject()
  private userService!: UserService;

  @Inject()
  private favoriteService!: FavoriteService;

  private greetingMessage = 'Hello World!';

  get user(): User {
    return this.userService.findById(this.userId);
  }

  saveFavorite(): void {
    this.favoriteService.save(this.user);
    this.$emit('saved');
  }
}
</script>
