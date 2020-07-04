<template>
  <v-dialog v-model="show" persistent>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Register form</v-toolbar-title>
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
                  v-model="name"
                  :error-messages="nameErrors"
                  label="Name*"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  :error-messages="emailErrors"
                  label="E-mail*"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="password"
                  :error-messages="passwordErrors"
                  label="Password*"
                  required
                  :type="show1 ? 'text' : 'password'"
                  @click:append="show1 = !show1"
                  counter
                ></v-text-field>
                <v-text-field v-model="city" label="City"></v-text-field>
                <v-text-field v-model="country" label="Country"></v-text-field>
                <InputUserImage
                  :isCreate="true"
                  @uploadImage="file => (this.imageFile = file)"
                  ref="inputUserImage"
                />
                <small>*indicates required field</small>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="mr-4" @click="submit">Register</v-btn>
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
import InputUserImage from "@/components/ui/InputUserImage.vue";
import { UserModule, UserState } from "../../store/modules/user";

@Component({
  name: "registerDialog",
  components: {
    InputUserImage
  }
})
export default class extends Vue {
  @Prop({ default: false }) show!: boolean;

  $refs!: {
    inputUserImage: InputUserImage;
  };

  private name = "";
  private email = "";
  private password = "";
  private city = "";
  private country = "";
  private imageFile: Blob = new Blob();
  private error = "";
  private show1 = false;

  private get isAuthenticated() {
    return UserModule.isAuthenticated;
  }

  private get errors() {
    return UserModule.errors;
  }

  get nameErrors() {
    return "";
  }

  get emailErrors() {
    return "";
  }

  get passwordErrors() {
    return "";
  }

  submit() {
    const newUser: Partial<UserState> = {
      name: this.name,
      email: this.email,
      password: this.password
    };
    if (this.city) newUser.city = this.city;
    if (this.country) newUser.country = this.country;
    UserModule.REGISTER(newUser).then(userId => {
      if (!userId) return;
      UserModule.LOGIN({
        email: this.email,
        password: this.password
      }).then(() => {
        if (this.imageFile) this.putPhoto(userId);
        if (this.isAuthenticated) {
          this.$emit("update:show", false);
          this.clear();
        }
      });
    });
  }

  clear() {
    this.name = "";
    this.email = "";
    this.password = "";
    this.city = "";
    this.country = "";
    UserModule.RESET_ERROR();
    this.show1 = false;
    this.imageFile = new Blob();
    this.$refs.inputUserImage.resetUploadedImage();
  }

  cancel() {
    UserModule.RESET_ERROR();
    this.$emit("update:show", false);
  }

  async putPhoto(userId: number) {
    UserModule.PUT_USER_PHOTO({
      userId: userId,
      image: this.imageFile,
      imageType: this.imageFile.type
    });
  }
}
</script>

<style>
.v-dialog {
  box-shadow: none;
}
</style>
