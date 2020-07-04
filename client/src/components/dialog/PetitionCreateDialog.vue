<template>
  <div>
    <CreateButton
      class="petitionButton"
      v-if="isAuthenticated"
      @click="dialog = true"
      :disabled="dialog"
    />
    <v-dialog v-model="dialog" persistent>
      <v-card color="grey lighten-4" text>
        <v-card-title>Create Petition</v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-form ref="form">
              <v-layout row wrap>
                <v-flex md12>
                  <InputImage
                    :petitionId="petition.petitionId"
                    :is-create="true"
                    @uploadImage="file => (this.imageFile = file)"
                    ref="inputImage"
                  />
                </v-flex>
                <v-flex md4>
                  <v-text-field
                    name="Title"
                    type="text"
                    label="Title"
                    v-model="title"
                    required
                  />
                </v-flex>
                <v-flex xs3>
                  <v-select
                    label="Select"
                    :items="petitionCategoryName"
                    v-model="category"
                    max-height="400"
                    hint="category"
                    persistent-hint
                  ></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-text-field
                    class="nowrap"
                    name="Description"
                    label="Description"
                    v-model="description"
                    multi-line
                    required
                  />
                </v-flex>
                <v-flex md4>
                  <AddDateButton @set="setDate" ref="addDateButton" />
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click.native="save">Save</v-btn>
          <v-btn color="green darken-1" text @click.native="cancel"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import CreateButton from "@/components/ui/CreateButton.vue";
import InputImage from "@/components/ui/InputImage.vue";
import AddDateButton from "@/components/ui/AddDateButton.vue";
import API_URL from "../../common/config";
import { UserModule } from "../../store/modules/user";
import { HomeModule, PetitionCategory } from "../../store/modules/home";
import { PetitionModule, PetitionState } from "../../store/modules/petition";

@Component({
  name: "petitionCreateDialog",
  components: {
    CreateButton,
    InputImage,
    AddDateButton
  }
})
export default class extends Vue {
  @Prop({ default: false }) isProfile!: boolean;

  $refs!: {
    addDateButton: AddDateButton;
    inputImage: InputImage;
  };

  private API_URL: string = API_URL;
  private dialog = false;
  private disabledButton = false;
  private petitionCategoryName: string[] = [];
  private imageFile: Blob = new Blob();
  private title = "";
  private description = "";
  private category = "";
  private date = "";
  private newPetition: PetitionState = { petitionId: 1 };

  private get petition() {
    return PetitionModule.petition;
  }

  private get petitionCategory() {
    return HomeModule.petitionCategory;
  }

  private get params() {
    return HomeModule.params;
  }

  private get user() {
    return UserModule.user;
  }

  private get isAuthenticated() {
    return UserModule.isAuthenticated;
  }

  mounted() {
    HomeModule.FETCH_PETITION_CATEGORY().then(() => {
      this.petitionCategoryName = this.petitionCategory.map(c => c.name);
    });
  }

  public updateNewPetition() {
    this.newPetition.title = this.title;
    this.newPetition.description = this.description;
    const newPetitionCategory:
      | PetitionCategory
      | undefined = this.petitionCategory.find(
      (c: { name: string }) => c.name == this.category
    );
    if (newPetitionCategory)
      this.newPetition.categoryId = newPetitionCategory.categoryId;
    if (this.date) this.newPetition.closingDate = this.date;
  }

  public save() {
    this.updateNewPetition();
    PetitionModule.PUBLISH_PETITION(this.newPetition)
      .then(({ data }) => {
        PetitionModule.SIGN_PETITION(data.petitionId).then(() => {
          this.putPhoto(data.petitionId).then(() => {
            this.reset();
          });
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  public reset() {
    if (this.isProfile) {
      HomeModule.FETCH_PETITIONS({ authorId: this.user.userId });
    } else {
      HomeModule.FETCH_PETITIONS(this.params);
    }
    this.init();
    this.dialog = false;
  }

  public cancel() {
    this.dialog = false;
  }

  public async putPhoto(petitionId: number) {
    PetitionModule.PUT_PETITION_PHOTO({
      petitionId: petitionId,
      image: this.imageFile,
      imageType: this.imageFile.type
    });
  }

  public init() {
    this.imageFile = new Blob();
    this.title = "";
    this.description = "";
    this.category = "";
    this.newPetition = { petitionId: 1 };
    this.$refs.addDateButton.cancelDatePicker();
    this.$refs.inputImage.resetUploadedImage();
  }

  public setDate(date: string) {
    this.date = date;
  }
}
</script>

<style scoped>
.petitionButton {
  margin-left: 15px;
  margin-right: 0px;
  margin-top: 73px;
  position: fixed;
  z-index: 10;
}
</style>
