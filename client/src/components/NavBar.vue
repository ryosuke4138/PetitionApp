<template>
  <div>
    <v-app-bar :fixed="true" max-height="64px">
      <TitleButton />
      <v-spacer></v-spacer>
      <v-btn class="loginButton" v-if="!isAuthenticated" @click="showLoginDialog = true">Login</v-btn>
      <v-btn v-if="!isAuthenticated" @click="showRegisterDialog = true">Register</v-btn>
      <router-link class="button" :to="{ name: 'profile' }">
        <v-btn v-if="isAuthenticated">Profile</v-btn>
      </router-link>
      <LogoutButton v-if="isAuthenticated" />
    </v-app-bar>
    <LoginDialog :show.sync="showLoginDialog" />
    <RegisterDialog :show.sync="showRegisterDialog" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import LogoutButton from "@/components/ui/LogoutButton.vue";
import LoginDialog from "@/components/dialog/LoginDialog.vue";
import RegisterDialog from "@/components/dialog/RegisterDialog.vue";
import TitleButton from "@/components/ui/TitleButton.vue";
import { UserModule } from "../store/modules/user";

@Component({
  name: "navBar",
  components: {
    LogoutButton,
    TitleButton,
    LoginDialog,
    RegisterDialog
  }
})
export default class extends Vue {
  private showLoginDialog = false;
  private showRegisterDialog = false;

  get isAuthenticated() {
    return UserModule.isAuthenticated;
  }

  get user() {
    return UserModule.user;
  }
}
</script>

<style lang="scss" scoped>
.no-under-line {
  text-decoration: none;
  text-shadow: 1;
}

.loginButton {
  margin-right: 5px;
}

.button {
  text-decoration: false;
}
</style>
