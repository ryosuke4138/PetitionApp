<template>
  <div>
    <v-img class="profileImage" v-if="image" :src="image" />
    <v-icon v-else large>mdi-account-circle</v-icon>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import API_URL from "../../common/config";
import { UserModule } from "../../store/modules/user";

@Component({ name: "userImage" })
export default class extends Vue {
  @Prop({ default: null }) private petitionId!: number | null;
  @Prop({ default: null }) private userId!: number | null;

  private image = "";
  private API_URL: string = API_URL;

  created() {
    if (this.userId) this.getImage(this.userId);
  }

  @Watch("userId")
  public watchUserId(val: number) {
    this.getImage(val);
  }

  public getImage(userId: number) {
    if (!userId) return;
    UserModule.FETCH_USER_PHOTO(userId)
      .then(() => {
        this.image = this.API_URL + "users/" + userId + "/photo";
      })
      .catch(() => {
        this.image = "";
      });
  }
}
</script>

<style scoped>
.profileImage {
  border-width: 4%;
  border-style: solid;
  border-color: rgba(42, 42, 255, 0.534);
}
</style>
