<template>
  <v-btn @click="logout">Logout</v-btn>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { UserModule } from "../../store/modules/user";

@Component({ name: "logoutButton" })
export default class extends Vue {
  public logout() {
    UserModule.LOGOUT();
    this.$router.push({ name: "home" });
  }
}
</script>
