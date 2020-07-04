<template>
  <v-dialog v-model="showPasswordDialog" persistent>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Change Password</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-alert
                  v-if="errors"
                  outlined
                  type="warning"
                  prominent
                  border="left"
                  >{{ errors }}</v-alert
                >
                <v-text-field
                  v-model="oldPassword"
                  label="Old Password"
                  required
                  :error-messages="oldPasswordErrors"
                  @input="$v.oldPassword.$touch()"
                  @blur="$v.oldPassword.$touch()"
                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show1 ? 'text' : 'password'"
                  @click:append="show1 = !show1"
                  counter
                ></v-text-field>
                <v-text-field
                  v-model="newPassword"
                  label="New Password"
                  required
                  :error-messages="newPasswordErrors"
                  @input="$v.newPassword.$touch()"
                  @blur="$v.newPassword.$touch()"
                  :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="show2 ? 'text' : 'password'"
                  @click:append="show2 = !show2"
                  counter
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="mr-4" @click="submit">Login</v-btn>
              <v-btn class="mr-4" @click="clear">Clear</v-btn>
              <v-btn class="mr-4" @click="cancel">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { UserModule } from "../../store/modules/user";

@Component({
  name: "petitionCreateDialog"
})
export default class extends Vue {
  @Prop({ default: false }) showPasswordDialog!: boolean;

  private oldPassword = "";
  private newPassword = "";
  private error = "";
  private show1 = false;
  private show2 = false;

  private get user() {
    return UserModule.user;
  }

  private get errors() {
    return UserModule.errors;
  }

  get oldPasswordErrors() {
    return "";
  }

  get newPasswordErrors() {
    return "";
  }

  submit() {
    UserModule.UPDATE_USER(this.user.userId, {
      password: this.newPassword,
      currentPassword: this.oldPassword
    })
      .then(() => {
        this.clear();
        this.$emit("closeDialog");
      })
      .catch(() => {
        this.clear();
      });
  }

  clear() {
    this.oldPassword = "";
    this.newPassword = "";
    UserModule.RESET_ERROR();
    this.show1 = false;
    this.show2 = false;
  }

  cancel() {
    this.clear();
    this.$emit("closeDialog");
  }
}
</script>

<style>
.v-dialog {
  box-shadow: none;
}
</style>
