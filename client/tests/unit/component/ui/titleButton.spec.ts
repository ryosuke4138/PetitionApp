import { shallowMount } from "@vue/test-utils";
import TitleButton from "@/components/ui/TitleButton.vue";

describe("TitleButton.vue", () => {
  it("show the title when passed", () => {
    const title = "VOTE PETITION";
    const wrapper = shallowMount(TitleButton, {});
    expect(wrapper.text()).toMatch(title);
  });
});
