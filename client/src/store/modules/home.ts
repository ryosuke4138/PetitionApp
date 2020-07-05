import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule,
} from "vuex-module-decorators";
import store from "@/store";
import { PetitionsService } from "@/common/api.service";
import { PetitionState } from "./petition";

export interface ParametersState {
  q?: string;
  categoryId?: number;
  authorId?: number;
  sortBy?: string;
}

export interface PetitionCategory {
  categoryId: number;
  name: string;
}

export interface HomeState {
  petitions: PetitionState[];
  isLoading: boolean;
  petitionCount: number;
  page: number;
  petitionCategory: PetitionCategory[];
  params: ParametersState;
  isProfile: boolean;
}

@Module({ dynamic: true, store, name: "home" })
class Home extends VuexModule implements HomeState {
  petitions: PetitionState[] = [];
  isLoading = true;
  petitionCount = 0;
  page = 1;
  petitionCategory: PetitionCategory[] = [];
  params: ParametersState = {
    q: "",
    sortBy: "ALPHABETICAL_DESC",
  }; // for searching, filtering, sorting petitions
  isProfile = false;

  @Mutation
  private FETCH_START() {
    this.isLoading = true;
  }

  @Mutation
  private FETCH_PETITIONS_END(petitions: PetitionState[]) {
    this.petitions = petitions;
    this.petitionCount = petitions.length;
    this.isLoading = false;
  }

  @Mutation
  private FETCH_CATEGORY_END(category: PetitionCategory[]) {
    this.petitionCategory = category;
    this.isLoading = false;
  }

  @Mutation
  private UPDATE_PAGE_NUMBER(pageNumber: number) {
    this.page = pageNumber;
  }

  @Mutation
  private UPDATE_PARAMS(val: ParametersState) {
    this.params = val;
  }

  @Mutation
  private IS_PROFILE(bool: boolean) {
    this.isProfile = bool;
  }

  @Action({ rawError: true })
  public FETCH_PETITIONS(params: ParametersState) {
    this.FETCH_START();
    return PetitionsService.query(params)
      .then(({ data }: { data: PetitionState[] }) => {
        this.FETCH_PETITIONS_END(data);
      })
      .catch((error: string) => {
        throw new Error(error);
      });
  }

  @Action({ rawError: true })
  public FETCH_PETITION_CATEGORY() {
    this.FETCH_START();
    return PetitionsService.getCategories()
      .then(({ data }: { data: PetitionCategory[] }) => {
        this.FETCH_CATEGORY_END(data);
      })
      .catch((error: string) => {
        throw new Error(error);
      });
  }

  @Action
  public SET_PAGE(val: number) {
    this.UPDATE_PAGE_NUMBER(val);
  }

  @Action
  public SET_PARAMS(val: ParametersState) {
    this.UPDATE_PARAMS(val);
  }

  @Action
  public SET_IS_PROFILE(bool: boolean) {
    this.IS_PROFILE(bool);
  }
}

export const HomeModule = getModule(Home);
