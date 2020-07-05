<template>
  <div class="text-center">
    <router-link :class="{ 'no-under-line': true }" :to="{ name: 'home' }">
      <v-btn class="ma-2" tile outlined color="success" dark>VOTE PETITION</v-btn>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
@Component({ name: "titleButton" })
export default class extends Vue {}
</script>

<style scoped>
.no-under-line {
  text-decoration: none;
}
</style>
