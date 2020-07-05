<template>
  <v-row :class="{ top: true }" justify="center">
    <v-col cols="12" sm="10" md="8" lg="6">
      <v-card ref="form">
        <v-card-title>Search, Filter, and Sort Petitions</v-card-title>
        <v-card-text>
          <v-text-field label="Name" ref="name" v-model="q"></v-text-field>
          <v-autocomplete
            ref="category"
            v-model="category"
            :items="categories"
            label="Category"
            placeholder="Select.."
          ></v-autocomplete>
          <v-autocomplete
            ref="sort"
            v-model="sort"
            :items="sorts"
            label="Sort"
            placeholder="Select.."
          ></v-autocomplete>
        </v-card-text>
        <v-divider class="mt-12"></v-divider>
        <v-card-actions>
          <v-btn text @click="cancelFilter">Cancel Filter</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="submit">Filter</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import {
  HomeModule,
  PetitionCategory,
  ParametersState
} from "../../store/modules/home";

@Component({ name: "petitionSearchCard" })
export default class extends Vue {
  @Prop({ required: true }) private defaultParams!: {
    q: string;
    categoryId: number;
    sortBy: string;
  };

  private q: string = this.defaultParams.q;
  private category = "";
  private categories: string[] = [];
  private sort = "";
  private sorts: ReadonlyArray<string> = [
    "Alphabetically by title, A-Z",
    "Alphabetically by title, Z-A",
    "Number of signatures, least to most",
    "Number of signatures, most to least"
  ];
  private sortsQuery: ReadonlyArray<string> = [
    "ALPHABETICAL_ASC",
    "ALPHABETICAL_DESC",
    "SIGNATURES_ASC",
    "SIGNATURES_DESC"
  ];
  formHasErrors = false;

  private get petitionCategory() {
    return HomeModule.petitionCategory;
  }

  private get petitionCount() {
    return HomeModule.petitionCount;
  }

  mounted() {
    HomeModule.FETCH_PETITION_CATEGORY().then(() => {
      this.categories = this.petitionCategory.map(
        (c: PetitionCategory) => c.name
      );
      if (this.defaultParams.categoryId) {
        const newCategory:
          | PetitionCategory
          | undefined = this.petitionCategory.find(
          (c: PetitionCategory) => c.categoryId == this.defaultParams.categoryId
        );
        if (newCategory) {
          this.category = newCategory.name;
        }
      }
    });
    this.sort = this.sorts[this.sortsQuery.indexOf(this.defaultParams.sortBy)];
  }

  public cancelFilter() {
    this.q = "";
    this.category = "";
    this.sort = "Number of signatures, most to least";
    this.submit();
  }
  public submit() {
    const newParams: ParametersState = { q: this.q };
    if (this.category) {
      const newParamsCategory:
        | PetitionCategory
        | undefined = this.petitionCategory.find(
        (c: { name: string }) => c.name == this.category
      );
      if (newParamsCategory)
        newParams.categoryId = newParamsCategory.categoryId;
    }
    newParams.sortBy = this.sortsQuery[this.sorts.indexOf(this.sort)];
    HomeModule.FETCH_PETITIONS(newParams);
    HomeModule.SET_PARAMS(newParams);
    HomeModule.SET_PAGE(1);
  }
}
</script>

<style scoped>
.top {
  margin-top: 72px;
}
</style>
