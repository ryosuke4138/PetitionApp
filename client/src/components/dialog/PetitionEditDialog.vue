<template>
  <v-dialog v-model="dialog" persistent>
    <v-card color="grey lighten-4" text>
      <v-card-title>Edit Petition</v-card-title>
      <v-card-text>
        <v-container fluid>
          <v-form ref="form">
            <v-layout row wrap>
              <v-flex md12>
                <InputImage
                  :petitionId="petition.petitionId"
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
                <EditDateButton
                  :defaultDate="petition.closingDate"
                  @set="setDate"
                  ref="editDateButton"
                />
              </v-flex>
            </v-layout>
          </v-form>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click.native="edit">Save</v-btn>
        <v-btn color="green darken-1" text @click.native="cancel">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import API_URL from "../../common/config";
import InputImage from "@/components/ui/InputImage.vue";
import EditDateButton from "@/components/ui/EditDateButton.vue";
import { UserModule } from "../../store/modules/user";
import { HomeModule, PetitionCategory } from "../../store/modules/home";
import { PetitionModule, PetitionState } from "../../store/modules/petition";

@Component({
  name: "petitionEditDialog",
  components: {
    InputImage,
    EditDateButton
  }
})
export default class extends Vue {
  @Prop({ default: false }) dialog!: boolean;
  @Prop({ required: true }) defaultPetition!: PetitionState;

  $refs!: {
    inputImage: InputImage;
    editDateButton: EditDateButton;
  };

  private API_URL: string = API_URL;
  private petitionCategoryName: string[] = [];
  private imageFile: Blob = new Blob();
  private title?: string = this.defaultPetition.title;
  private description?: string = this.defaultPetition.description;
  private category?: string = this.defaultPetition.category;
  private date?: string = this.defaultPetition.closingDate;
  private newPetition: PetitionState = { petitionId: 0 };

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

  private get isProfile() {
    return HomeModule.isProfile;
  }

  mounted() {
    HomeModule.FETCH_PETITION_CATEGORY().then(() => {
      this.petitionCategoryName = this.petitionCategory.map(c => c.name);
    });
  }

  updateNewPetition() {
    this.newPetition.title = this.title;
    this.newPetition.description = this.description;
    const newCategory:
      | PetitionCategory
      | undefined = this.petitionCategory.find(c => c.name == this.category);
    if (newCategory) this.newPetition.categoryId = newCategory.categoryId;
    if (this.date) this.newPetition.closingDate = this.date;
  }

  edit() {
    this.updateNewPetition();
    const id = this.petition.petitionId;
    PetitionModule.UPDATE_PETITION({
      petitionId: id,
      newPetition: this.newPetition
    })
      .then(() => {
        if (this.imageFile) {
          this.putPhoto(id).then(() => {
            this.reset();
          });
        } else this.reset();
      })
      .catch(err => {
        console.log(err);
      });
  }

  reset() {
    if (this.isProfile) {
      HomeModule.FETCH_PETITIONS({ authorId: this.user.userId });
    } else {
      HomeModule.FETCH_PETITIONS(this.params);
    }
    this.$refs.inputImage.resetUploadedImage();
    this.newPetition = { petitionId: 0 };
    this.$emit("update:dialog", false);
  }

  cancel() {
    this.imageFile = new Blob();
    if (this.petition.title) this.title = this.petition.title;
    if (this.petition.description) this.description = this.petition.description;
    if (this.petition.category) this.category = this.petition.category;
    this.newPetition = { petitionId: 0 };
    this.$emit("update:dialog", false);
    if (this.petition.closingDate) {
      this.$refs.editDateButton.setDate(this.petition.closingDate);
    }
  }

  async putPhoto(petitionId: number) {
    PetitionModule.PUT_PETITION_PHOTO({
      petitionId: petitionId,
      image: this.imageFile,
      imageType: this.imageFile.type
    });
  }

  setDate(date: string) {
    this.date = date;
  }
}
</script>
