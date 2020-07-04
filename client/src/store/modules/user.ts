import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import store from "@/store";
import JwtService from "@/common/jwt.service";
import { UserService } from "@/common/api.service";
import ApiService from "@/common/api.service";
import { SignatoryState } from "./petition";

export interface UserState {
  userId: number;
  name: string;
  email?: string;
  city?: string;
  country?: string;
  password?: string;
  currentPassword?: string;
}

const initialUserState: UserState = {
  userId: 0,
  name: "",
  email: "",
  city: "",
  country: ""
};

export interface UserInterface {
  user: UserState;
  isAuthenticated: boolean;
  isLoading: boolean;
}

@Module({ dynamic: true, store, name: "petition" })
class User extends VuexModule implements UserInterface {
  public user: UserState = initialUserState;
  public signatories: SignatoryState[] = [];
  public isAuthenticated = !!JwtService.getToken();
  public isLoading = false;
  public errors = "";

  @Mutation
  private SET_IS_LOADING(bool: boolean) {
    this.isLoading = bool;
  }

  private SET_IS_USER_LOADING(val: boolean) {
    this.isLoading = val;
  }

  private SET_USER(user: UserState) {
    this.user = user;
  }

  private SET_ERROR(errors: string) {
    this.errors = errors;
  }

  private SET_AUTH(token: string) {
    this.isAuthenticated = true;
    this.errors = "";
    JwtService.saveToken(token);
  }

  private PURGE_AUTH() {
    this.isAuthenticated = false;
    this.user = initialUserState;
    this.errors = "";
    JwtService.destroyToken();
  }

  @Action
  public async LOGIN(credentials: object) {
    try {
      const { data } = await UserService.login(credentials);
      this.SET_AUTH(data.token);
      ApiService.setHeader();
      const result = await UserService.getOne(data.userId);
      const userObj = result.data;
      userObj.userId = data.userId;
      this.SET_USER(userObj);
      return userObj;
    } catch {
      this.SET_ERROR("Wrong Credentials. Please Try Again.");
    }
  }

  public LOGOUT() {
    this.PURGE_AUTH();
  }

  public async REGISTER(credentials: object) {
    try {
      const { data } = await UserService.register(credentials);
      this.SET_AUTH;
      return data.userId;
    } catch {
      this.SET_ERROR("Failed to register");
      return null;
    }
  }

  public async FETCH_USER(userId: number) {
    try {
      ApiService.setHeader();
      const { data } = await UserService.getOne(userId);
      data.userId = userId;
      this.SET_USER(data);
      return data;
    } catch (response) {
      return response;
    }
  }

  public async UPDATE_USER(
    userId: number,
    userInfo: Partial<UserState>
  ): Promise<void> {
    ApiService.setHeader();
    await UserService.update(userId, userInfo);
    const { data } = await UserService.getOne(userId);
    data.userId = userId;
    this.SET_USER(data);
  }

  public async FETCH_USER_PHOTO(userId: number) {
    ApiService.setHeader();
    return await UserService.getPhoto(userId);
  }

  public RESET_ERROR() {
    this.SET_ERROR("");
  }

  public async PUT_USER_PHOTO(userInfo: {
    userId: number;
    image: Blob;
    imageType: string;
  }) {
    ApiService.setHeader();
    this.SET_IS_USER_LOADING(true);
    await UserService.updatePhoto(
      userInfo.userId,
      userInfo.image,
      userInfo.imageType
    );
    this.SET_IS_USER_LOADING(false);
  }

  public async DELETE_USER_PHOTO(userId: number) {
    ApiService.setHeader();
    this.SET_IS_USER_LOADING(true);
    await UserService.deletePhoto(userId);
    this.SET_IS_USER_LOADING(false);
  }
}

export const UserModule = getModule(User);
