<template>
  <v-card class="mx-auto" max-width="344" outlined>
    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title class="headline mb-1">{{
          user.name
        }}</v-list-item-title>
        <v-list-item-subtitle>Email: {{ user.email }}</v-list-item-subtitle>
        <v-list-item-subtitle>City: {{ user.city }}</v-list-item-subtitle>
        <v-list-item-subtitle>Country: {{ user.country }}</v-list-item-subtitle>
      </v-list-item-content>

      <UserImage :key="index" class="avatar" :userId="user.userId" />
    </v-list-item>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="openProfileDialog" text>Edit</v-btn>
      <v-btn @click="openPasswordDialog" text>Change Password</v-btn>
    </v-card-actions>

    <EditProfileDialog
      :showProfileDialog.sync="isOpenProfileDialog"
      @closeDialog="isOpenProfileDialog = false"
    />
    <ChangePasswordDialog
      :showPasswordDialog.sync="isOpenPasswordDialog"
      @closeDialog="isOpenPasswordDialog = false"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { UserModule } from "../../store/modules/user";
import UserImage from "@/components/ui/UserImage.vue";
import EditProfileDialog from "@/components/dialog/EditProfileDialog.vue";
import ChangePasswordDialog from "@/components/dialog/ChangePasswordDialog.vue";

@Component({
  name: "profileCard",
  components: {
    UserImage,
    EditProfileDialog,
    ChangePasswordDialog
  }
})
export default class extends Vue {
  private isOpenProfileDialog = false;
  private isOpenPasswordDialog = false;
  private index = 0;

  get user() {
    return UserModule.user;
  }

  get isUserLoading() {
    return UserModule.isLoading;
  }

  public openProfileDialog() {
    this.isOpenProfileDialog = true;
  }
  public openPasswordDialog() {
    this.isOpenPasswordDialog = true;
  }

  @Watch("isUserLoading")
  watchIsUserLoading(val: boolean) {
    if (!val) this.index++;
  }
}
</script>

<style scoped>
.mx-auto {
  box-shadow: none;
}

.avatar {
  max-width: 150px;
  max-height: 150px;
  border-width: 4%;
  border-style: solid;
  border-color: white;
}
</style>
