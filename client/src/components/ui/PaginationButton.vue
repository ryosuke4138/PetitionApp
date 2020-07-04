<template>
  <div class="text-center">
    <v-pagination
      v-model="pageNumber"
      :length="Math.ceil(petitionCount / numPerPage)"
      :total-visible="7"
    ></v-pagination>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { UserModule } from "../../store/modules/user";
import { HomeModule } from "../../store/modules/home";

@Component({ name: "logoutButton" })
export default class extends Vue {
  private NUM_PER_PAGE = 10;
  private pageNumber = 1;
  private numPerPage: number = this.NUM_PER_PAGE;

  private get petitionCount() {
    return HomeModule.petitionCount;
  }

  private get page() {
    return HomeModule.page;
  }

  public logout() {
    UserModule.LOGOUT();
    this.$router.push({ name: "home" });
  }
}
</script>
