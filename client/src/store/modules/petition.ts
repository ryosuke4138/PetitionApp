import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import { PetitionsService, SignaturesService } from "@/common/api.service";
import ApiService from "@/common/api.service";

export interface PetitionState {
  petitionId: number;
  title?: string;
  category?: string;
  categoryId?: number;
  authorId?: number;
  authorName?: string;
  signatureCount?: number;
  description?: string;
  authorCity?: string;
  authorCountry?: string;
  createdDate?: string;
  closingDate?: string;
}

export interface SignatoryState {
  city: string;
  country: string;
  display: string;
}

export interface UserPetitionState {
  petition: PetitionState;
  signatories: SignatoryState[];
  isSigned: boolean;
  isLoading: boolean;
}

const initialPetitionState: PetitionState = {
  petitionId: 0,
  title: "",
  category: "",
  authorId: 0,
  authorName: "",
  signatureCount: 0,
  description: "",
  authorCity: "",
  authorCountry: "",
  createdDate: "",
  closingDate: ""
};

@Module({ dynamic: true, store, name: "petition" })
class Petition extends VuexModule implements UserPetitionState {
  public petition: PetitionState = initialPetitionState;
  public signatories: SignatoryState[] = [];
  public isSigned = false;
  public isLoading = false;

  @Mutation
  private SET_IS_LOADING(bool: boolean) {
    this.isLoading = bool;
  }

  private SET_PETITION(petition: PetitionState) {
    this.petition = petition;
  }

  private SET_SIGNATORIES(signatories: SignatoryState[]) {
    this.signatories = signatories;
  }

  private RESET() {
    this.petition = initialPetitionState;
  }

  private SET_IS_SIGNED(bool: boolean) {
    this.isSigned = bool;
  }

  @Action
  private slashToHyphen(date: string): string {
    const [day, month, year] = date.substr(0, 10).split("/");
    return `${year}-${month}-${day}`;
  }

  private formatDate(date: string): string {
    if (!date) return "";
    return this.slashToHyphen(new Date(date).toLocaleString());
  }

  private formatDisplayDate(createdDate: string, closingDate: string): string {
    if (closingDate) {
      return createdDate + " - " + closingDate;
    } else {
      return createdDate + " - (not set yet)";
    }
  }

  public async FETCH_PETITION(slug: number) {
    ApiService.setHeader();
    const { data } = await PetitionsService.get(slug);
    data.createdDate = this.formatDate(data.createdDate);
    data.closingDate = this.formatDate(data.closingDate);
    data.displayDate = this.formatDisplayDate(
      data.createdDate,
      data.closingDate
    );
    this.SET_PETITION(data);
    return data;
  }

  public async DELETE_PETITION(slug: number) {
    ApiService.setHeader();
    await PetitionsService.destroy(slug);
  }

  public async UPDATE_PETITION(d: {
    petitionId: number;
    newPetition: PetitionState;
  }) {
    ApiService.setHeader();
    await PetitionsService.update(d.petitionId, d.newPetition);
    const { data } = await PetitionsService.get(d.petitionId);
    data.createdDate = this.formatDate(data.createdDate);
    data.closingDate = this.formatDate(data.closingDate);
    data.displayDate = this.formatDisplayDate(
      data.createdDate,
      data.closingDate
    );
    this.SET_PETITION(data);
  }

  public RESET_PETITION() {
    this.RESET();
  }

  public async PUBLISH_PETITION(params: object) {
    ApiService.setHeader();
    return await PetitionsService.create(params);
  }

  public async PUT_PETITION_PHOTO(data: {
    petitionId: number;
    image: Blob;
    imageType: string;
  }): Promise<void> {
    ApiService.setHeader();
    this.SET_IS_LOADING(true);
    await PetitionsService.updatePhoto(
      data.petitionId,
      data.image,
      data.imageType
    );
    this.SET_IS_LOADING(false);
  }

  public async FETCH_SIGNATURES(slug: number) {
    ApiService.setHeader();
    const { data } = await SignaturesService.get(slug);
    this.SET_SIGNATORIES(data);
    return data;
  }

  public async SIGN_PETITION(slug: number) {
    ApiService.setHeader();
    await SignaturesService.sign(slug);
    this.SET_IS_SIGNED(true);
  }

  public async UNSIGN_PETITION(slug: number) {
    ApiService.setHeader();
    await SignaturesService.unsign(slug);
    this.SET_IS_SIGNED(false);
  }
}

export const PetitionModule = getModule(Petition);

// const getters = {
//   signatories(state) {
//     state.signatories = state.signatories.map((signatory) => {
//       if (signatory.city && signatory.country) {
//         signatory.display = signatory.city + ", " + signatory.country;
//       } else {
//         signatory.display = signatory.city + signatory.country;
//       }
//       signatory.display = signatory.display
//         ? "(" + signatory.display + ")"
//         : "";
//       return signatory;
//     });
//     return state.signatories;
//   },
// };
