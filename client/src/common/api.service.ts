import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import JwtService from "@/common/jwt.service";
import API_URL from "@/common/config";

const ApiService = {
  init() {
    Vue.use(VueAxios, axios);
    Vue.axios.defaults.baseURL = API_URL;
  },

  setHeader() {
    Vue.axios.defaults.headers.common[
      "X-Authorization"
    ] = JwtService.getToken();
  },

  query(resource: string, params: object) {
    return Vue.axios.get(resource, params).catch((error) => {
      throw new Error(`ApiService ${error}`);
    });
  },

  get(resource: string) {
    return Vue.axios.get(resource).catch((error) => {
      throw new Error(`ApiService ${error}`);
    });
  },

  getOne(resource: string, slug: number) {
    return Vue.axios.get(`${resource}/${slug}`).catch((error) => {
      throw new Error(`ApiService ${error}`);
    });
  },

  post(resource: string, params: object) {
    return Vue.axios.post(`${resource}`, params);
  },

  update(resource: string, slug: number, params: object) {
    return Vue.axios.put(`${resource}/${slug}`, params);
  },

  patch(resource: string, slug: number, params: object) {
    return Vue.axios.patch(`${resource}/${slug}`, params);
  },

  putPhoto(resource: string, params: Blob, imageType: string) {
    const headers = { "content-type": imageType };
    return Vue.axios.put(`${resource}`, params, { headers });
  },

  getPhoto(resource: string) {
    return Vue.axios.get(resource);
  },

  delete(resource: string) {
    return Vue.axios.delete(resource);
  },

  getSignatures(slug: number) {
    return Vue.axios.get(`petitions/${slug}/signatures`).catch((error) => {
      throw new Error(`ApiService ${error}`);
    });
  },
};

export default ApiService;

export const PetitionsService = {
  query(q?: object) {
    if (q) {
      return ApiService.query("petitions", { params: q });
    } else {
      return ApiService.get("petitions");
    }
  },

  get(slug: number) {
    return ApiService.getOne("petitions", slug);
  },

  create(params: object) {
    return ApiService.post("petitions", params);
  },

  update(slug: number, params: object) {
    return ApiService.patch("petitions", slug, params);
  },

  destroy(slug: number) {
    return ApiService.delete(`petitions/${slug}`);
  },

  getCategories() {
    return ApiService.get("petitions/categories");
  },

  updatePhoto(slug: number, image: Blob, imageType: string) {
    return ApiService.putPhoto(`petitions/${slug}/photo`, image, imageType);
  },
};

export const SignaturesService = {
  get(slug: number) {
    return ApiService.getSignatures(slug);
  },

  sign(slug: number) {
    return ApiService.post(`petitions/${slug}/signatures`, {});
  },

  unsign(slug: number) {
    return ApiService.delete(`petitions/${slug}/signatures`);
  },
};

export const UserService = {
  register(params: object) {
    return ApiService.post("users/register", params);
  },

  login(params: object) {
    return ApiService.post("users/login", params);
  },

  getOne(slug: number) {
    return ApiService.getOne("users", slug);
  },

  update(slug: number, params: object) {
    return ApiService.patch("users", slug, params);
  },

  getPhoto(slug: number) {
    return ApiService.getPhoto(`users/${slug}/photo`);
  },

  updatePhoto(slug: number, params: Blob, imageType: string) {
    return ApiService.putPhoto(`users/${slug}/photo`, params, imageType);
  },

  deletePhoto(slug: number) {
    return ApiService.delete(`users/${slug}/photo`);
  },
};
