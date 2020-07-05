<template>
  <v-app>
    <NavBar />
    <PetitionCreateDialog />
    <PetitionSearchCard :default-params="params" />
    <v-container fluid>
      <v-row>
        <PetitionCard
          class="petitionCard"
          v-for="(petition, i) in slicedPetition"
          :key="'VHome' + i"
          :petition="petition"
          :target-petition-id.sync="targetPetitionId"
        />
      </v-row>
    </v-container>
    <PaginationButton />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import NavBar from "@/components/NavBar.vue";
import PetitionCreateDialog from "@/components/dialog/PetitionCreateDialog.vue";
import PetitionCard from "@/components/card/PetitionCard.vue";
import PetitionSearchCard from "@/components/card/PetitionSearchCard.vue";
import PaginationButton from "@/components/ui/PaginationButton.vue";
import { HomeModule } from "../store/modules/home";

@Component({
  name: "vhome",
  components: {
    NavBar,
    PetitionCreateDialog,
    PetitionCard,
    PetitionSearchCard,
    PaginationButton
  }
})
export default class extends Vue {
  private targetPetitionId: number | null = null;

  get petitions() {
    return HomeModule.petitions;
  }
  get page() {
    return HomeModule.page;
  }
  get petitionCount() {
    return HomeModule.petitionCount;
  }
  get params() {
    return HomeModule.params;
  }

  mounted() {
    HomeModule.FETCH_PETITIONS(this.params);
  }

  // only 10 petitions should be appeared in the page
  private get slicedPetition() {
    const startIndex = (this.page - 1) * 10;
    return this.petitions.slice(startIndex, startIndex + 10);
  }
}
</script>

<style lang="scss" scoped>
v-row {
  margin-left: 5px;
  margin-left: 5px;
}
.pagination {
  margin-left: auto;
  margin-right: auto;
}
.petitionCard {
  margin: 8px;
}
</style>
