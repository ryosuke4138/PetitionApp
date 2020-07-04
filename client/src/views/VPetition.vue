<template>
  <v-app>
    <NavBar />
    <v-img
      :key="index"
      :class="{ petitionImg: true }"
      max-height="400px"
      max-width="800px"
      :src="API_URL + 'petitions/' + petition.petitionId + '/photo'"
    ></v-img>
    <div :class="{ row: true }">
      <p :class="{ title: true }">{{ petition.title }}</p>
      <p :class="{ date: true }">{{ petition.displayDate }}</p>
      <v-spacer />
      <SignButton
        :class="{ actionButton: true }"
        v-if="isAuthenticated && !isAuthor"
        :petitionId="petition.petitionId"
        :userId="user.userId"
        :isExpired="isExpired"
      />
      <v-btn
        :class="{ actionButton: true }"
        v-if="isAuthor && !isExpired"
        color="green darken-1"
        text
        @click.native="edit"
        >Edit</v-btn
      >
      <v-btn
        :class="{ actionButton: true }"
        v-if="isAuthor"
        color="green darken-1"
        text
        @click.native="remove"
        >Delete</v-btn
      >
      <v-btn
        :class="{ actionButton: true }"
        color="green darken-1"
        text
        @click.native="close"
        >Close</v-btn
      >
    </div>
    <v-divider :class="{ divider: true }" />
    <SocialSharingButton />
    <p :class="{ userInfo: true }">Category: {{ petition.category }}</p>
    <p :class="{ userInfo: true }">
      Signature Count: {{ petition.signatureCount }}
    </p>
    <p :class="{ userInfo: true }">
      Author:
      <v-avatar size="36">
        <UserImage :userId="petition.authorId" />
      </v-avatar>
      {{ petition.authorName }} {{ place }}
    </p>
    <p :class="{ userInfo: true }">Description: {{ petition.description }}</p>
    <v-divider />
    <p :class="{ subtitle: true }">List of Signatories</p>
    <div
      v-for="(signatory, i) in signatories"
      :key="'VPetitionVRow' + i"
      no-gutters
    >
      <div>
        <v-subheader class="pa-2">
          <v-avatar size="36">
            <UserImage :userId="signatory.signatoryId" />
          </v-avatar>
          {{ signatory.name }} {{ signatory.display }}
        </v-subheader>
      </div>
    </div>
    <PetitionEditDialog
      :dialog.sync="showEditDialog"
      :defaultPetition="petition"
    />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import NavBar from "@/components/NavBar.vue";
import UserImage from "@/components/ui/UserImage.vue";
import SignButton from "@/components/ui/SignButton.vue";
import PetitionEditDialog from "@/components/dialog/PetitionEditDialog.vue";
import SocialSharingButton from "@/components/ui/SocialSharingButton.vue";
import API_URL from "../common/config";
import { HomeModule } from "../store/modules/home";
import { UserModule } from "../store/modules/user";
import { PetitionModule } from "../store/modules/petition";

@Component({
  name: "vpetition",
  components: {
    NavBar,
    UserImage,
    SignButton,
    PetitionEditDialog,
    SocialSharingButton
  }
})
export default class extends Vue {
  private API_URL: string = API_URL;
  private showEditDialog = false;
  private index = 0;

  get petition() {
    return PetitionModule.petition;
  }
  get isAuthenticated() {
    return UserModule.isAuthenticated;
  }
  get user() {
    return UserModule.user;
  }
  get signatories() {
    return PetitionModule.signatories;
  }
  get params() {
    return HomeModule.params;
  }
  get isProfile() {
    return HomeModule.isProfile;
  }
  get isPetitionLoading() {
    return PetitionModule.isLoading;
  }

  private get isAuthor(): boolean {
    return this.isAuthenticated && this.user.userId === this.petition.authorId;
  }

  private get isExpired() {
    return (
      this.petition.closingDate &&
      new Date(this.petition.closingDate) <= new Date()
    );
  }

  private get place(): string {
    if (this.petition.authorCity && this.petition.authorCountry) {
      return (
        "(" +
        this.petition.authorCity +
        ", " +
        this.petition.authorCountry +
        ")"
      );
    } else if (this.petition.authorCity && !this.petition.authorCountry) {
      return "(" + this.petition.authorCity + ")";
    } else if (!this.petition.authorCity && this.petition.authorCountry) {
      return "(" + this.petition.authorCountry + ")";
    } else {
      return "";
    }
  }

  @Watch("isPetitionLoading")
  incIndex() {
    this.index++;
  }

  public edit() {
    this.showEditDialog = true;
  }

  public close() {
    if (this.isProfile) {
      this.$router.push({
        name: "profile",
        params: { username: this.user.name }
      });
    } else {
      this.$router.push({ name: "home" });
    }
  }

  public remove() {
    if (this.petition.petitionId) {
      PetitionModule.DELETE_PETITION(this.petition.petitionId).then(() => {
        if (this.isProfile) {
          HomeModule.FETCH_PETITIONS({
            authorId: this.user.userId
          }).then(() => {
            const name = this.user.name;
            this.$router.push({ name: "profile", params: { name } });
            PetitionModule.RESET_PETITION();
          });
        } else {
          HomeModule.FETCH_PETITIONS(this.params).then(() => {
            this.$router.push({ name: "home" });
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.title {
  font-weight: normal;
  text-align: center;
  margin-top: 7px;
  margin-right: 13px;
  margin-bottom: 0px;
  font-size: 20px;
}
.subtitle {
  font-weight: normal;
  text-align: left;
  margin-top: 5px;
  margin-left: 15px;
  font-size: 18px;
}
.divider {
  margin-top: 40px;
}
.userInfo {
  font-weight: normal;
  text-align: left;
  margin-top: 5px;
  margin-left: 15px;
  font-size: 18px;
  background-color: none;
}
.date {
  font-weight: normal;
  text-align: center;
  margin-top: 13px;
  margin-bottom: 15px;
  font-size: 15px;
}
.row {
  margin-left: 10px;
  margin-right: 0;
  height: 2px;
}
.petitionImg {
  margin-top: 64px;
  margin-left: auto;
  margin-right: auto;
}
.actionButton {
  margin-top: 5px;
}
</style>
