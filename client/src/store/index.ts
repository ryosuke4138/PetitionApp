import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

import { HomeState } from "./modules/home";
import { PetitionState } from "./modules/petition";
import { UserState } from "./modules/user";

Vue.use(Vuex);

export interface RootState {
  app: HomeState;
  petition: PetitionState;
  user: UserState;
}

// Declare empty store first, dynamically register all modules later.
export default new Vuex.Store<RootState>({
  plugins: [createPersistedState({ storage: window.sessionStorage })]
});
