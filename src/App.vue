<template>
  <User :userId="1" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import User from './components/User.vue';

@Component({
  components: {
    User,
  },
})
export default class App extends Vue {}
</script>

<style>
.composant {
  padding: 12px;
  border: 1px solid grey;
}
</style>
