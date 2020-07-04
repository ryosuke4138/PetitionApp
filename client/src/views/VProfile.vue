<template>
  <v-app>
    <NavBar />
    <PetitionCreateDialog :isProfile="true" />
    <h1 :class="{ title: true }">Profile</h1>
    <v-row align="center">
      <ProfileCard />
    </v-row>
    <h1 :class="{ title: true }">My Petitions</h1>
    <h3 v-if="!petitions.length" :class="{ alert: true }">
      No Petitions Registered..
    </h3>
    <v-row align="center">
      <PetitionCard
        v-for="(petition, i) in petitions"
        :key="'VProfile' + i"
        :petition="petition"
        :is-profile="true"
        :show-petition-details-dialog.sync="showPetitionDetailsDialog"
        :target-petition-id.sync="targetPetitionId"
      />
    </v-row>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavBar from "@/components/NavBar.vue";
import ProfileCard from "@/components/card/ProfileCard.vue";
import PetitionCard from "@/components/card/PetitionCard.vue";
import PetitionCreateDialog from "@/components/dialog/PetitionCreateDialog.vue";
import { HomeModule } from "../store/modules/home";
import { UserModule } from "../store/modules/user";

@Component({
  name: "vprofile",
  components: {
    NavBar,
    ProfileCard,
    PetitionCard,
    PetitionCreateDialog
  }
})
export default class extends Vue {
  private showPetitionDetailsDialog = false;
  private targetPetitionId: number | null = null;

  get petitions() {
    return HomeModule.petitions;
  }

  get user() {
    return UserModule.user;
  }

  mounted() {
    HomeModule.FETCH_PETITIONS({ authorId: this.user.userId });
  }
}
</script>

<style scoped>
.title {
  font-weight: normal;
  text-align: center;
  margin-bottom: 20px;
  margin-top: 92px;
  font-size: 24px;
}
.alert {
  font-weight: normal;
  text-align: center;
  margin-top: 50px;
  margin-bottom: 20px;
  font-size: 14px;
}
</style>
