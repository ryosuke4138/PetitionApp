<template>
  <v-card class="mx-auto" max-width="400">
    <v-img
      class="white--text align-end"
      height="200px"
      :src="API_URL + 'petitions/' + petition.petitionId + '/photo'"
      :key="'PetitionCard' + index"
    ></v-img>
    <v-card-title class="cardTitle">{{ petition.title }}</v-card-title>
    <v-card-subtitle class="pb-0">Signature Count: {{ petition.signatureCount }}</v-card-subtitle>
    <v-card-text class="text--primary">
      <div>{{ petition.category }}</div>
      <div>Created by {{ petition.authorName }}</div>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="explore" text>Explore</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import API_URL from "../../common/config";
import { HomeModule } from "../../store/modules/home";
import { PetitionModule, PetitionState } from "../../store/modules/petition";

@Component({ name: "petitionCard" })
export default class extends Vue {
  @Prop({ required: true }) petition!: PetitionState;
  @Prop({ default: false }) isProfile!: boolean;

  private readonly API_URL: string = API_URL;
  private targetPetitionId: number | null = null;
  private index: number = this.petition.petitionId * 10 ** 8;

  private get isLoading() {
    return PetitionModule.isLoading;
  }

  @Watch("isLoading")
  watchIsLoading(val: boolean) {
    if (val) this.index++;
  }

  public explore() {
    Promise.all([
      PetitionModule.FETCH_SIGNATURES(this.petition.petitionId),
      PetitionModule.FETCH_PETITION(this.petition.petitionId)
    ]).then(() => {
      HomeModule.SET_IS_PROFILE(this.isProfile);
      const id = `${this.petition.petitionId}`;
      this.$router.push({ name: "petition", params: { id } });
    });
  }
}
</script>

<style scoped></style>
