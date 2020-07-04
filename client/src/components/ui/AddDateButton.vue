<template>
  <div class="dateButton">
    <v-btn v-if="!isOpenDatePicker" @click="openDatePicker"
      >Add Closing Date</v-btn
    >
    <div v-if="isOpenDatePicker">
      <v-container>
        <v-col cols="12" lg="6">
          <v-menu
            ref="menu1"
            v-model="menu1"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="dateFormatted"
                label="Closing Date"
                hint="MM/DD/YYYY format"
                persistent-hint
                prepend-icon="mdi-calendar"
                @blur="date = parseDate(dateFormatted)"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="date"
              no-title
              @input="menu1 = false"
              :allowed-dates="allowedDates"
            ></v-date-picker>
          </v-menu>
        </v-col>
      </v-container>
      <v-btn @click="cancelDatePicker">Cancel Input Date</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
@Component({
  name: "addDateButton"
})
export default class extends Vue {
  private isOpenDatePicker = false;
  private date = "";
  private tommorow = "";
  private dateFormatted = "";
  private menu1 = false;
  private currentDate: string = new Date().toISOString().substr(0, 10);

  get computedDateFormatted() {
    return this.formatDate(this.date);
  }

  created() {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    this.tommorow =
      this.parseDateMMDDYYYY(tmr.toLocaleString().substr(0, 10)) || "";
    this.date = this.tommorow;
  }

  @Watch("date")
  watchDate() {
    this.dateFormatted = this.formatDate(this.date);
    if (this.isOpenDatePicker)
      this.$emit("set", this.parseDate(this.dateFormatted) + " 00:00:00.000");
  }

  private allowedDates(val: any) {
    const date1 = new Date();
    const date2 = new Date(val);
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth() + 1;
    const day1 = date1.getDate();

    const year2 = date2.getFullYear();
    const month2 = date2.getMonth() + 1;
    const day2 = date2.getDate();

    if (year1 == year2) {
      if (month1 == month2) {
        return day1 < day2;
      } else {
        return month1 < month2;
      }
    } else {
      return year1 < year2;
    }
  }

  private openDatePicker() {
    this.isOpenDatePicker = true;
    this.$emit("set", this.parseDate(this.dateFormatted) + " 00:00:00.000");
  }

  private formatDate(date: string) {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${month}/${day}/${year}`;
  }

  private parseDate(date: string) {
    if (!date) return "";
    const [month, day, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  private parseDateMMDDYYYY(date: string) {
    if (!date) return "";
    const [day, month, year] = date.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  cancelDatePicker() {
    this.isOpenDatePicker = false;
    this.date = this.tommorow;
    this.$emit("set", null);
  }
}
</script>
