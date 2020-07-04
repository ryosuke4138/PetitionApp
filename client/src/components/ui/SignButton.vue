<template>
  <div>
    <v-btn v-if="!isSigned && !isExpired" @click="sign">Sign</v-btn>
    <v-btn v-if="isSigned && !isExpired" @click="unsign">Unsign</v-btn>
    <v-subheader v-if="isExpired">Expired</v-subheader>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { PetitionModule } from "../../store/modules/petition";

@Component({ name: "signButton" })
export default class extends Vue {
  @Prop() private petitionId!: number;
  @Prop({ default: null }) private userId!: number | null;
  @Prop({ default: false }) private isExpired!: boolean;

  private get isSigned() {
    return PetitionModule.isSigned;
  }

  created() {
    PetitionModule.FETCH_SIGNATURES(this.petitionId).then(signatures => {
      const signed = signatures.some(
        (signature: { signatoryId: number }) =>
          signature.signatoryId == this.userId
      );
      if (signed) PetitionModule.SIGN_PETITION(this.petitionId);
      else PetitionModule.UNSIGN_PETITION(this.petitionId);
    });
  }

  @Watch("petitionId")
  watchPetitionId(newPetitionId: number) {
    PetitionModule.FETCH_SIGNATURES(newPetitionId).then(signatures => {
      const signed = signatures.some(
        (signature: { signatoryId: number }) =>
          signature.signatoryId == this.userId
      );
      if (signed) PetitionModule.SIGN_PETITION(this.petitionId);
      else PetitionModule.UNSIGN_PETITION(this.petitionId);
    });
  }

  public sign() {
    if (this.petitionId) {
      PetitionModule.SIGN_PETITION(this.petitionId).then(() => {
        PetitionModule.FETCH_SIGNATURES(this.petitionId);
      });
    }
  }

  public unsign() {
    if (this.petitionId) {
      PetitionModule.UNSIGN_PETITION(this.petitionId).then(() => {
        PetitionModule.FETCH_SIGNATURES(this.petitionId);
      });
    }
  }
}
</script>
