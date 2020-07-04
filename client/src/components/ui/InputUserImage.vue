<template>
  <div class="imgContent">
    <div class="imagePreview">
      <v-img
        v-if="!uploadedImage && isCreate"
        class="white--text align-end"
        height="200px"
        src="../../assets/image/no_image.png"
      />
      <v-img
        v-if="!uploadedImage && !isCreate"
        class="white--text align-end"
        height="200px"
        :src="image"
        :key="index"
      />
      <v-img
        v-if="uploadedImage"
        class="white--text align-end"
        :src="uploadedImage"
      />
      <v-file-input
        v-model="uploadedImageFile"
        accept="image/png, image/jpeg, image/jpg, image/gif"
        placeholder="Pick an image"
        prepend-icon="mdi-camera"
        label="Profile Picture"
        @change="onFileChange"
      ></v-file-input>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import API_URL from "../../common/config";
import { UserModule } from "../../store/modules/user";

@Component({
  name: "inputUserImage"
})
export default class extends Vue {
  @Prop({ default: false }) isCreate!: boolean;

  private API_URL: string = API_URL;
  private uploadedImageFile: any = null;
  private uploadedImage: string | ArrayBuffer = "";
  private index = 0;
  private rules(value: { size: number }) {
    return [
      !value ||
        value.size < 20000000 ||
        "Image should be less than 20 MB, sorry"
    ];
  }

  private get user() {
    return UserModule.user;
  }
  mounted() {
    this.getImage();
  }

  @Watch("uploadedImageFile")
  watchUploadedImageFile(val: boolean) {
    if (!val) {
      this.uploadedImage = "";
    }
  }

  @Watch("isCreate")
  watchIsCreate(val: boolean) {
    if (val) {
      this.index++;
      this.getImage();
    }
  }

  onFileChange(file: Blob | null) {
    if (!file) {
      this.uploadedImage = "";
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.addEventListener("load", () => {
      this.uploadedImage = fr.result || "";
      this.$emit("uploadImage", file);
    });
  }

  resetUploadedImage() {
    this.uploadedImageFile = null;
  }

  getImage() {
    if (!this.user.userId) return;
    UserModule.FETCH_USER_PHOTO(this.user.userId)
      .then(() => {
        // this.image = this.API_URL + "users/" + this.user.userId + "/photo";
      })
      .catch(() => {
        // this.image = null;
      });
  }
}
</script>

<style scoped>
.imgContent {
  width: 90%;
  max-width: 300px;
  margin: auto;
  margin-bottom: 40px;
}
.imagePreview {
  height: 30vh;
  background: rgb(240, 240, 240);
  overflow: hidden;
  border-radius: 10px;
  background-position: center center;
  background-size: cover;
  margin-bottom: 30px;
  position: relative;
}
.fileUpload {
  text-align: center;
  position: absolute;
  height: 25px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  color: rgb(134, 134, 134);
  padding: 20px;
}
</style>
