<template>
  <v-dialog v-model="showProfileDialog" persistent>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Edit Profile</v-toolbar-title>
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
                  @input="$v.name.$touch()"
                  @blur="$v.name.$touch()"
                ></v-text-field>
                <v-text-field
                  v-model="email"
                  :error-messages="emailErrors"
                  label="E-mail*"
                  required
                  @input="$v.email.$touch()"
                  @blur="$v.email.$touch()"
                ></v-text-field>
                <v-text-field v-model="city" label="City"></v-text-field>
                <v-text-field v-model="country" label="Country"></v-text-field>
                <InputUserImage
                  :isCreate.sync="isCreate"
                  @uploadImage="file => (this.imageFile = file)"
                  ref="inputUserImage"
                />
                <v-btn class="mr-4" @click="deletePhoto">Delete Photo</v-btn>
              </v-form>
              <small>*indicates required field</small>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="mr-4" @click="submit">Edit</v-btn>
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
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import InputUserImage from "@/components/ui/InputUserImage.vue";
import { UserModule, UserState } from "../../store/modules/user";

@Component({
  name: "editProfileDialog",
  components: {
    InputUserImage
  }
})
export default class extends Vue {
  @Prop({ default: false }) showProfileDialog!: boolean;

  $refs!: {
    inputUserImage: InputUserImage;
  };

  private name?: string = "";
  private email?: string = "";
  private city?: string = "";
  private country?: string = "";
  private imageFile: Blob = new Blob();
  private error?: string = "";
  private showProfireDialog1 = false;
  private isCreate = false;
  private errors = "";

  private get user() {
    return UserModule.user;
  }

  get nameErrors() {
    return "";
  }

  get emailErrors() {
    return "";
  }

  @Watch("showProfileDialog")
  watchShowProfileDialog(val: boolean) {
    if (val) {
      this.name = this.user.name;
      this.email = this.user.email;
      this.city = this.user.city;
      this.country = this.user.country;
      this.isCreate = true;
    }
  }

  submit() {
    const newUser: Partial<UserState> = {
      name: this.name,
      email: this.email
    };
    if (this.city) newUser.city = this.city;
    if (this.country) newUser.country = this.country;
    UserModule.UPDATE_USER(this.user.userId, newUser)
      .then(() => {
        if (this.imageFile) this.putPhoto(this.user.userId);
        this.clear();
      })
      .catch(() => {
        this.errors = "Failed to edit profile";
      });
  }

  deletePhoto() {
    UserModule.DELETE_USER_PHOTO(this.user.userId);
    this.$emit("closeDialog");
    this.errors = "";
  }

  clear() {
    this.name = this.user.name;
    this.email = this.user.email;
    this.city = this.user.city;
    this.country = this.user.country;
    UserModule.RESET_ERROR();
    this.imageFile = new Blob();
    this.$refs.inputUserImage.resetUploadedImage();
    this.$emit("closeDialog");
    this.errors = "";
  }

  cancel() {
    UserModule.RESET_ERROR();
    this.isCreate = false;
    this.$emit("closeDialog");
    this.errors = "";
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
